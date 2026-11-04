import { useState } from 'react';
import AdminSidebar from '../components/AdminSidebar';
import './AdminProfilePage.css';
import { apiFetch } from '../utils/api';

export default function AdminProfilePage({ currentUser, onNavigate, onLogout, onUserUpdate }) {
  const [profile, setProfile] = useState({
    firstName: currentUser?.first_name || '',
    lastName: currentUser?.last_name || '',
    contact: currentUser?.contact || '',
  });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isSaving, setIsSaving] = useState(false);

  const updateProfile = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setMessage({ type: '', text: '' });
    try {
      const result = await apiFetch('/api/me', { method: 'PATCH', body: JSON.stringify(profile) });
      onUserUpdate(result.user);
      window.sessionStorage.setItem('fis_user', JSON.stringify(result.user));
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="admin-page-shell">
      <AdminSidebar activePage="adminProfile" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} />
      <main className="admin-profile-page admin-page-content">
        <header className="admin-profile-header">
          <p>General settings</p>
          <h1>Profile settings</h1>
          <span>Manage the account details used across the admin workspace.</span>
        </header>
        <section className="admin-profile-card">
          <div className="admin-profile-card-heading"><span>Account settings</span><h2>Personal information</h2></div>
          {message.text && <p className={`admin-profile-message ${message.type}`} role="alert">{message.text}</p>}
          <form className="admin-profile-form" onSubmit={updateProfile}>
            <label>First name<input value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} required /></label>
            <label>Last name<input value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} required /></label>
            <label>Email address<input value={currentUser?.email || ''} disabled /></label>
            <label>Contact number<input value={profile.contact} onChange={(event) => setProfile({ ...profile, contact: event.target.value.replace(/\D/g, '').slice(0, 10) })} pattern="\d{10}" required /></label>
            <button type="submit" className="admin-profile-save" disabled={isSaving}>{isSaving ? 'Saving...' : 'Save profile'}</button>
          </form>
        </section>
      </main>
    </div>
  );
}
