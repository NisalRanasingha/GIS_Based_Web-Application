import { useEffect, useState } from 'react';
import { apiFetch } from '../utils/api';
import FishForecastMap from '../components/FishForecastMap';
import { fishSpecies } from '../data/fishForecast';
import 'leaflet/dist/leaflet.css';
import './UserDashboardPage.css';

export default function UserDashboardPage({ currentUser, onNavigate, onLogout, onUserUpdate }) {
  const [forecasts, setForecasts] = useState([]);
  const [news, setNews] = useState([]);
  const [species, setSpecies] = useState('yellowfin');
  const [profile, setProfile] = useState({ firstName: currentUser.first_name || '', lastName: currentUser.last_name || '', contact: currentUser.contact || '' });
  const [message, setMessage] = useState({ type: '', text: '' });
  const [profileMessage, setProfileMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/fish-forecasts?species=${species}`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('Forecast service is unavailable.')))
      .then((result) => setForecasts(result.forecasts || []))
      .catch((error) => setMessage({ type: 'error', text: error.message }));
  }, [species]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/news?limit=3`)
      .then((response) => response.ok ? response.json() : Promise.reject(new Error('News service is unavailable.')))
      .then((result) => setNews(result.news || []))
      .catch((error) => setMessage({ type: 'error', text: error.message }));
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setProfileMessage({ type: '', text: '' });
    setSaving(true);
    try {
      const result = await apiFetch('/api/me', { method: 'PATCH', body: JSON.stringify(profile) });
      onUserUpdate(result.user);
      window.sessionStorage.setItem('fis_user', JSON.stringify(result.user));
      setProfileMessage({ type: 'success', text: 'Your profile was updated successfully.' });
    } catch (error) {
      setProfileMessage({ type: 'error', text: error.message });
    } finally {
      setSaving(false);
    }
  };

  const activeForecast = forecasts[0];
  const activeSpecies = fishSpecies[species];

  return (
    <main className="user-dashboard">
      <aside className="user-dashboard-sidebar">
        <div className="user-dashboard-logo"><span>FIS</span><strong>Fisheries<br />Information</strong></div>
        <p className="user-sidebar-label">Workspace</p>
        <nav><button className="active" type="button">⌂ <span>Overview</span></button></nav>
      </aside>
      <section className="user-dashboard-main">
        <header className="user-dashboard-header">
          <div><p>Wednesday, 04 November 2026</p><span>Here&apos;s your fisheries intelligence for today.</span></div>
          <div className="user-dashboard-actions"><button type="button" aria-label="Search">⌕</button><button type="button" aria-label="Notifications">♢</button><button type="button" className="user-profile-chip" onClick={() => setIsProfileOpen(true)}><b>{(currentUser.first_name || 'M').charAt(0)}</b>{currentUser.first_name || 'Member'}</button><button type="button" className="user-logout-top" onClick={onLogout}>Sign out</button></div>
        </header>
      {message.text && <div className={`user-dashboard-alert ${message.type}`} role="alert">{message.text}</div>}
      <section className="user-weather-grid">
        <article className="user-dashboard-card user-current-card"><div className="user-card-heading"><div><span>Today&apos;s fish forecast</span><h2>{activeSpecies.label}</h2></div><select value={species} onChange={(event) => setSpecies(event.target.value)} aria-label="Forecast species">{Object.entries(fishSpecies).map(([key, item]) => <option key={key} value={key}>{item.label}</option>)}</select></div><div className="user-current-summary"><div className="user-fish-icon">◒</div><div><strong>{activeForecast?.confidence ? `${Math.round(activeForecast.confidence)}%` : '—'}</strong><span>Model confidence</span></div><div><strong>{activeForecast?.forecast_date ? new Date(activeForecast.forecast_date).toLocaleDateString('en', { day: '2-digit', month: 'short' }) : '—'}</strong><span>Latest update</span></div></div><p className="user-card-note">{activeSpecies.description} Use this map as decision support alongside official safety advisories.</p></article>
        <article className="user-dashboard-card user-highlight-card"><div className="user-card-heading"><div><span>Account overview</span><h2>Member details</h2></div><b className="user-status-dot">● Active</b></div><div className="user-account-summary"><div className="user-avatar-large">{(currentUser.first_name || 'M').charAt(0)}</div><div><strong>{currentUser.first_name} {currentUser.last_name}</strong><small>{currentUser.email}</small><small>FIS member account</small></div></div><button type="button" className="user-outline-button" onClick={() => setIsProfileOpen(true)}>Manage profile →</button></article>
      </section>
      <section className="user-dashboard-card user-map-card"><div className="user-card-heading"><div><span>GIS decision support</span><h2>Fish forecasting map</h2></div><button type="button" onClick={() => onNavigate('fishForecast')}>Open full map →</button></div><div className="user-map"><FishForecastMap compact forecasts={forecasts} species={species} onSpeciesChange={setSpecies} onNavigate={onNavigate} /></div></section>
      {isProfileOpen && <div className="user-profile-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setIsProfileOpen(false)}><section className="user-profile-modal" role="dialog" aria-modal="true" aria-labelledby="user-profile-title"><div className="user-card-heading"><div><span>Personal information</span><h2 id="user-profile-title">Profile management</h2></div><button type="button" className="user-profile-close" onClick={() => setIsProfileOpen(false)} aria-label="Close profile settings">×</button></div>{profileMessage.text && <p className={`profile-feedback ${profileMessage.type}`} role="alert">{profileMessage.text}</p>}<form className="user-profile-form" onSubmit={saveProfile}><label>First name<input value={profile.firstName} onChange={(event) => setProfile({ ...profile, firstName: event.target.value })} required /></label><label>Last name<input value={profile.lastName} onChange={(event) => setProfile({ ...profile, lastName: event.target.value })} required /></label><label>Email address<input value={currentUser.email} disabled /></label><label>Contact number<input value={profile.contact} onChange={(event) => setProfile({ ...profile, contact: event.target.value.replace(/\D/g, '').slice(0, 10) })} pattern="\d{10}" required /></label><button className="user-save-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save profile'}</button></form></section></div>}
      <section className="user-dashboard-card user-news-card"><div className="user-card-heading"><div><span>Fisheries information center</span><h2>News &amp; events</h2></div><button type="button" onClick={() => onNavigate('news')}>View all →</button></div><div className="user-news-grid">{news.length ? news.map((item) => <article key={item.id}><span>{item.category}</span><h3>{item.title}</h3><p>{item.content}</p><small>{new Date(item.published_at).toLocaleDateString('en', { day: 'numeric', month: 'short', year: 'numeric' })}</small></article>) : <p className="user-card-note">No news updates are available right now.</p>}</div></section>
      </section>
    </main>
  );
}
