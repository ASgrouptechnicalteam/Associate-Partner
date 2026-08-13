import SftpClient from 'ssh2-sftp-client';
import path from 'path';
import fs from 'fs';
import { Readable } from 'stream';

export class StorageService {
  private static async getClient() {
    const client = new SftpClient();
    if (!process.env.STORAGE_SFTP_HOST || !process.env.STORAGE_SFTP_USER) {
      console.warn('SFTP credentials missing, falling back to dummy connection.');
      return null;
    }
    
    await client.connect({
      host: process.env.STORAGE_SFTP_HOST,
      port: parseInt(process.env.STORAGE_SFTP_PORT || '65002'),
      username: process.env.STORAGE_SFTP_USER,
      password: process.env.STORAGE_SFTP_PASSWORD,
    });
    return client;
  }

  /**
   * Uploads a file via SFTP. 
   * @param localFilePath Path to the temporary local file
   * @param destinationFilename The target filename
   * @param isPrivate Whether the file should be in the private or public directory
   * @returns The public URL (if public) or the private reference path
   */
  public static async uploadFile(localFilePath: string, destinationFilename: string, isPrivate: boolean): Promise<string> {
    const client = await this.getClient();
    
    const basePath = isPrivate 
      ? (process.env.STORAGE_PRIVATE_PATH || '/public_html/uploads/private') 
      : (process.env.STORAGE_PUBLIC_PATH || '/public_html/uploads/public');

    const fullDestPath = `${basePath}/${destinationFilename}`;

    if (!client) {
      // Dummy success for local dev without SFTP
      const baseUrl = process.env.STORAGE_PUBLIC_URL || 'http://localhost:3000/uploads';
      return isPrivate ? `private://${destinationFilename}` : `${baseUrl}/${destinationFilename}`;
    }

    try {
      // Ensure directory exists
      const dirExists = await client.exists(basePath);
      if (!dirExists) {
        await client.mkdir(basePath, true);
      }
      
      await client.fastPut(localFilePath, fullDestPath);
      
      if (isPrivate) {
        return `private://${destinationFilename}`;
      } else {
        const baseUrl = process.env.STORAGE_PUBLIC_URL || 'https://associatepartner.sonthilluconstructions.com/uploads/public';
        return `${baseUrl}/${destinationFilename}`;
      }
    } finally {
      await client.end();
    }
  }

  /**
   * Deletes a file via SFTP.
   */
  public static async deleteFile(fileRef: string): Promise<void> {
    const client = await this.getClient();
    if (!client) return;

    try {
      let targetPath = '';
      if (fileRef.startsWith('private://')) {
        const filename = fileRef.replace('private://', '');
        const basePath = process.env.STORAGE_PRIVATE_PATH || '/public_html/uploads/private';
        targetPath = `${basePath}/${filename}`;
      } else {
        // Parse the filename from the public URL
        const urlObj = new URL(fileRef);
        const filename = path.basename(urlObj.pathname);
        const basePath = process.env.STORAGE_PUBLIC_PATH || '/public_html/uploads/public';
        targetPath = `${basePath}/${filename}`;
      }

      const exists = await client.exists(targetPath);
      if (exists) {
        await client.delete(targetPath);
      }
    } catch (err) {
      console.error('Error deleting file:', err);
    } finally {
      await client.end();
    }
  }

  /**
   * Retrieves a ReadStream for a private file.
   */
  public static async getFileStream(fileRef: string): Promise<Readable | null> {
    const client = await this.getClient();
    if (!client) {
      // Mock stream for dev fallback
      const mockStream = new Readable();
      mockStream.push('mock file content');
      mockStream.push(null);
      return mockStream;
    }

    if (!fileRef.startsWith('private://')) {
      throw new Error('Only private:// references can be streamed securely.');
    }

    try {
      const filename = fileRef.replace('private://', '');
      const basePath = process.env.STORAGE_PRIVATE_PATH || '/public_html/uploads/private';
      const targetPath = `${basePath}/${filename}`;

      const exists = await client.exists(targetPath);
      if (!exists) return null;

      // createReadStream returns a stream
      const stream = client.createReadStream(targetPath) as Readable;
      
      // Monkeypatch the end method to close client when stream is done
      stream.on('end', () => {
        client.end();
      });
      stream.on('error', () => {
        client.end();
      });

      return stream;
    } catch (err) {
      client.end();
      throw err;
    }
  }

  /**
   * Cleans up local temporary files created by Multer.
   */
  public static cleanupLocalFiles(files: Express.Multer.File | Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined) {
    if (!files) return;

    const deleteFile = (f: Express.Multer.File) => {
      if (f.path && fs.existsSync(f.path)) {
        fs.unlinkSync(f.path);
      }
    };

    if (Array.isArray(files)) {
      files.forEach(deleteFile);
    } else if (files.fieldname) {
      deleteFile(files as Express.Multer.File);
    } else {
      Object.values(files).forEach((fileArray) => {
        fileArray.forEach(deleteFile);
      });
    }
  }
}
