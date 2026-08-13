import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { User, MapPin, FileText, Landmark } from 'lucide-react';
import AppLayout from '../components/AppLayout';

export default function ProfileEditPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    primaryPhone: '',
    whatsappNumber: '',
    email: '',
    bloodGroup: '',
    secondaryPhone: '',
    emergencyContact: '',
    currentAddress: '',
    permanentAddress: '',
    aadhaar: '',
    pan: '',
    accountHolder: '',
    bank: '',
    accountNo: '',
    ifsc: '',
    branch: '',
  });

  const [existingPhotos, setExistingPhotos] = useState<{
    profilePhoto?: string;
    aadhaarFile?: string;
    panFile?: string;
  }>({});

  const [files, setFiles] = useState<{
    profilePhoto?: File;
    aadhaarFile?: File;
    panFile?: File;
  }>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response: any = await api.profile.get();
      const p = response.profile;
      if (p) {
        setFormData({
          primaryPhone: p.primaryPhone || '',
          whatsappNumber: p.whatsappNumber || '',
          email: p.email || '',
          bloodGroup: p.bloodGroup || '',
          secondaryPhone: p.secondaryPhone || '',
          emergencyContact: p.emergencyContact || '',
          currentAddress: p.currentAddress || '',
          permanentAddress: p.permanentAddress || '',
          aadhaar: p.aadhaar || '',
          pan: p.pan || '',
          accountHolder: p.accountHolder || '',
          bank: p.bank || '',
          accountNo: p.accountNo || '',
          ifsc: p.ifsc || '',
          branch: p.branch || '',
        });
        setExistingPhotos({
          profilePhoto: p.profilePhoto,
          aadhaarFile: p.aadhaarFile,
          panFile: p.panFile,
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => ({ ...prev, [e.target.name]: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });
      Object.entries(files).forEach(([key, file]) => {
        if (file) payload.append(key, file);
      });

      const res = await api.profile.updateMultipart(payload);
      if (res.success) {
        navigate('/profile');
      } else {
        setError(res.error || 'Failed to update profile');
        setSaving(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Edit Profile">
        <div style={{ padding: 'var(--space-6)' }}>Loading profile...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Edit Profile">
      <div>
        <div style={{ marginBottom: 'var(--space-6)' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Edit Profile</h1>
          <p className="text-muted">Update your personal, address, and banking details.</p>
        </div>

        {error && (
          <div style={{ backgroundColor: 'var(--danger-light)', color: 'var(--danger)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-4)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* Personal Information */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <User style={{ color: 'var(--primary)' }} size={20} /> Personal Information
            </h3>
            <div className="responsive-grid-2">
              <div className="input-group">
                {existingPhotos.profilePhoto && (
                  <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <img src={existingPhotos.profilePhoto} alt="Current Photo" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-light)' }} />
                    <span className="caption">Current Photo</span>
                  </div>
                )}
                <label className="input-label">Profile Photo</label>
                <input type="file" name="profilePhoto" accept="image/*" onChange={handleFileChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">Primary Phone</label>
                <input type="text" name="primaryPhone" value={formData.primaryPhone} onChange={handleInputChange} className="input-control" required />
              </div>
              <div className="input-group">
                <label className="input-label">WhatsApp Number</label>
                <input type="text" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} className="input-control" required />
              </div>
              <div className="input-group">
                <label className="input-label">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="input-control" required />
              </div>
              <div className="input-group">
                <label className="input-label">Blood Group</label>
                <input type="text" name="bloodGroup" value={formData.bloodGroup} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">Secondary Contact</label>
                <input type="text" name="secondaryPhone" value={formData.secondaryPhone} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">Emergency Contact</label>
                <input type="text" name="emergencyContact" value={formData.emergencyContact} onChange={handleInputChange} className="input-control" />
              </div>
            </div>
          </div>

          {/* Address */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <MapPin style={{ color: 'var(--primary)' }} size={20} /> Address
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              <div className="input-group">
                <label className="input-label">Current Address</label>
                <textarea name="currentAddress" value={formData.currentAddress} onChange={handleInputChange} className="input-control" rows={3} required />
              </div>
              <div className="input-group">
                <label className="input-label">Permanent Address</label>
                <textarea name="permanentAddress" value={formData.permanentAddress} onChange={handleInputChange} className="input-control" rows={3} required />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <FileText style={{ color: 'var(--primary)' }} size={20} /> Documents <span style={{ fontSize: '12px', fontWeight: 'normal', color: 'var(--text-muted)' }}>(Upload new to replace)</span>
            </h3>
            <div className="responsive-grid-2">
              <div className="input-group">
                <label className="input-label">Aadhaar Number</label>
                <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                {existingPhotos.aadhaarFile && (
                  <div style={{ marginBottom: '8px' }}>
                    <a href={existingPhotos.aadhaarFile} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={14} /> View Current Aadhaar
                    </a>
                  </div>
                )}
                <label className="input-label">Upload Aadhaar</label>
                <input type="file" name="aadhaarFile" accept=".pdf,image/*" onChange={handleFileChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">PAN Number</label>
                <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                {existingPhotos.panFile && (
                  <div style={{ marginBottom: '8px' }}>
                    <a href={existingPhotos.panFile} target="_blank" rel="noreferrer" style={{ fontSize: '13px', color: 'var(--primary)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                      <FileText size={14} /> View Current PAN
                    </a>
                  </div>
                )}
                <label className="input-label">Upload PAN</label>
                <input type="file" name="panFile" accept=".pdf,image/*" onChange={handleFileChange} className="input-control" />
              </div>
            </div>
          </div>

          {/* Banking */}
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-light)', paddingBottom: '8px' }}>
              <Landmark style={{ color: 'var(--primary)' }} size={20} /> Banking Details
            </h3>
            <div className="responsive-grid-2">
              <div className="input-group">
                <label className="input-label">Account Holder Name</label>
                <input type="text" name="accountHolder" value={formData.accountHolder} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">Bank Name</label>
                <input type="text" name="bank" value={formData.bank} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">Account Number</label>
                <input type="text" name="accountNo" value={formData.accountNo} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">IFSC Code</label>
                <input type="text" name="ifsc" value={formData.ifsc} onChange={handleInputChange} className="input-control" />
              </div>
              <div className="input-group">
                <label className="input-label">Branch</label>
                <input type="text" name="branch" value={formData.branch} onChange={handleInputChange} className="input-control" />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-4)', paddingTop: 'var(--space-4)', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" onClick={() => navigate('/profile')} className="btn btn-secondary">Cancel</button>
            <button type="submit" disabled={saving} className="btn btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
