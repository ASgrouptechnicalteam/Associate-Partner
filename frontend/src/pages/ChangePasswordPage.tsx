import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';

export default function ChangePasswordPage() {
  const navigate = useNavigate();
  const { refresh } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }
    if (form.newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true); setError('');
    try {
      await api.auth.changePassword(form.currentPassword, form.newPassword);
      await refresh();
      setSuccess(true);
      setTimeout(() => navigate('/'), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
      setLoading(false);
    }
  };

  return (
    <AppLayout title="Change Password">
      <div className="card" style={{ maxWidth: 480 }}>
        <h2 style={{ marginBottom: 8 }}>Set New Password</h2>
        <p className="text-muted" style={{ marginBottom: 24 }}>
          Please update your password to continue accessing the portal.
        </p>

        {error && (
          <div style={{ background: 'var(--error-bg)', color: 'var(--error)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 14 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: 'var(--success-bg)', color: 'var(--success)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 16, fontSize: 14 }}>
            Password changed successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {(['currentPassword', 'newPassword', 'confirmPassword'] as const).map((field) => (
            <div key={field} className="input-group">
              <label className="input-label">
                {field === 'currentPassword' ? 'Current Password' : field === 'newPassword' ? 'New Password' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                className="input-control"
                value={form[field]}
                onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                required
                minLength={field !== 'currentPassword' ? 8 : undefined}
              />
            </div>
          ))}
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Saving...' : 'Change Password'}
          </button>
        </form>
      </div>
    </AppLayout>
  );
}
