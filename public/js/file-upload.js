document.addEventListener('DOMContentLoaded', () => {
  const components = document.querySelectorAll('.custom-upload-component');

  components.forEach(component => {
    const input = component.querySelector('.visually-hidden-file-input');
    const dropzone = component.querySelector('.custom-upload-zone');
    const previewContainer = component.querySelector('.custom-upload-preview-container');
    const errorContainer = component.querySelector('.custom-upload-error');
    const maxSize = parseFloat(component.getAttribute('data-max-size') || 10);
    const isMultiple = component.getAttribute('data-multiple') === 'true';

    // Store the selected files (we use DataTransfer to programmatically update input.files)
    let selectedFiles = [];

    // Trigger file dialog on dropzone click
    dropzone.addEventListener('click', () => {
      input.click();
    });

    // Keyboard accessibility
    dropzone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        input.click();
      }
    });

    // Drag and Drop
    dropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });

    dropzone.addEventListener('dragleave', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });

    dropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFiles(Array.from(e.dataTransfer.files));
      }
    });

    // Native input change
    input.addEventListener('change', () => {
      if (input.files && input.files.length > 0) {
        handleFiles(Array.from(input.files));
      }
    });

    function handleFiles(files) {
      errorContainer.style.display = 'none';
      errorContainer.innerHTML = '';

      // Validate sizes
      const validFiles = [];
      let hasError = false;

      for (const file of files) {
        const fileSizeMB = file.size / (1024 * 1024);
        if (fileSizeMB > maxSize) {
          showError(`File "${file.name}" exceeds the maximum size of ${maxSize} MB.`);
          hasError = true;
          if (!isMultiple) break;
          continue;
        }
        validFiles.push(file);
      }

      if (validFiles.length === 0) {
        if (!isMultiple && !hasError) {
          // Cleared via native dialog cancel (though some browsers don't trigger change on cancel)
          clearFiles();
        }
        return;
      }

      if (isMultiple) {
        // Append new files
        selectedFiles = [...selectedFiles, ...validFiles];
      } else {
        // Replace single file
        selectedFiles = [validFiles[0]];
      }

      updateInputAndRender();
    }

    function updateInputAndRender() {
      // Create a DataTransfer object to sync files back to the native input
      const dataTransfer = new DataTransfer();
      selectedFiles.forEach(f => dataTransfer.items.add(f));
      input.files = dataTransfer.files;

      // Render previews
      if (selectedFiles.length > 0) {
        dropzone.style.display = 'none';
        previewContainer.style.display = 'flex';
        renderPreviews();
      } else {
        dropzone.style.display = 'flex';
        previewContainer.style.display = 'none';
        previewContainer.innerHTML = '';
      }
    }

    function renderPreviews() {
      previewContainer.innerHTML = '';
      
      selectedFiles.forEach((file, index) => {
        const sizeStr = formatBytes(file.size);
        const isImage = file.type.startsWith('image/');
        
        const card = document.createElement('div');
        card.className = 'file-preview-card';
        
        // Thumbnail area
        let thumbHtml = '';
        if (isImage) {
          // We create an img tag with empty src, and load it asynchronously
          thumbHtml = `<img src="" class="file-thumbnail" id="thumb-${input.id}-${index}" alt="${file.name}">`;
        } else if (file.type === 'application/pdf') {
          thumbHtml = `<div class="file-thumbnail"><i data-lucide="file-text"></i></div>`;
        } else if (file.type.startsWith('video/')) {
          thumbHtml = `<div class="file-thumbnail"><i data-lucide="video"></i></div>`;
        } else {
          thumbHtml = `<div class="file-thumbnail"><i data-lucide="file"></i></div>`;
        }

        // Actions html
        let actionsHtml = '';
        if (!isMultiple) {
          actionsHtml = `
            <button type="button" class="btn btn-secondary action-replace" style="height: 32px; padding: 0 12px; font-size: 13px;">Replace</button>
            <button type="button" class="btn btn-secondary action-remove" style="height: 32px; padding: 0 12px; font-size: 13px; color: var(--error); border-color: var(--error);">Remove</button>
          `;
        } else {
          actionsHtml = `
            <button type="button" class="btn btn-secondary action-remove" style="height: 32px; padding: 0 12px; font-size: 13px; color: var(--error); border-color: var(--error);">Remove</button>
          `;
        }

        card.innerHTML = `
          <div class="file-preview-info">
            ${thumbHtml}
            <div class="file-details">
              <span class="file-name" title="${file.name}">${file.name}</span>
              <span class="file-size">${sizeStr}</span>
            </div>
          </div>
          <div class="file-actions">
            ${actionsHtml}
          </div>
        `;

        // Bind events
        if (!isMultiple) {
          card.querySelector('.action-replace').addEventListener('click', () => {
            input.click();
          });
        }
        card.querySelector('.action-remove').addEventListener('click', () => {
          removeFile(index);
        });

        previewContainer.appendChild(card);

        // Load image preview asynchronously
        if (isImage) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const imgEl = document.getElementById(`thumb-${input.id}-${index}`);
            if (imgEl) imgEl.src = e.target.result;
          };
          reader.readAsDataURL(file);
        }
      });

      // If multiple, add a "Add another file" button at the bottom of the list
      if (isMultiple) {
        const addMoreBtn = document.createElement('button');
        addMoreBtn.type = 'button';
        addMoreBtn.className = 'btn btn-secondary';
        addMoreBtn.style.marginTop = '8px';
        addMoreBtn.innerHTML = '<i data-lucide="plus"></i> Add another file';
        addMoreBtn.addEventListener('click', () => input.click());
        previewContainer.appendChild(addMoreBtn);
      }

      // Re-initialize Lucide icons for dynamically added HTML
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }

    function removeFile(index) {
      selectedFiles.splice(index, 1);
      updateInputAndRender();
    }

    function clearFiles() {
      selectedFiles = [];
      updateInputAndRender();
    }

    function showError(msg) {
      errorContainer.innerHTML = `<i data-lucide="alert-circle" style="width: 16px; height: 16px;"></i> ${msg}`;
      errorContainer.style.display = 'flex';
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  });

  function formatBytes(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }
});
