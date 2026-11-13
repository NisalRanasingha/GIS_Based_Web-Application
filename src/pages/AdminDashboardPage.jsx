import { useCallback, useEffect, useState } from 'react';
import './AdminDashboardPage.css';
import { DEFAULT_NEWS_IMAGE, getNewsImageUrls } from '../utils/newsImage';
import { apiFetch } from '../utils/api';
import AdminSidebar from '../components/AdminSidebar';

const statusLabels = { new: 'New', in_progress: 'In progress', resolved: 'Resolved' };
const formatDate = (value) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export default function AdminDashboardPage({ currentUser, onNavigate, onLogout, onUserUpdate }) {
  const [inquiryData, setInquiryData] = useState({ inquiries: [], stats: {} });
  const [news, setNews] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [userForm, setUserForm] = useState(null);
  const [userSaving, setUserSaving] = useState(false);
  const [userMessage, setUserMessage] = useState({ type: '', text: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [inquiryResponse, newsResponse, usersResponse] = await Promise.all([
        apiFetch('/api/admin/inquiries'),
        apiFetch('/api/admin/news'),
        apiFetch('/api/admin/users'),
      ]);
      setInquiryData({ inquiries: inquiryResponse.inquiries || [], stats: inquiryResponse.stats || {} });
      setNews(newsResponse.news || []);
      setUsers(usersResponse.users || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const selectUser = (user) => {
    setSelectedUserId(user.id);
    setUserMessage({ type: '', text: '' });
    setUserForm({
      firstName: user.first_name,
      lastName: user.last_name,
      email: user.email,
      contact: user.contact,
      role: user.role,
      password: '',
    });
  };

  const saveUser = async (event) => {
    event.preventDefault();
    setUserSaving(true);
    setUserMessage({ type: '', text: '' });
    try {
      const result = await apiFetch(`/api/admin/users/${selectedUserId}`, {
        method: 'PATCH',
        body: JSON.stringify(userForm),
      });
      setUsers((current) => current.map((user) => user.id === result.user.id ? result.user : user));
      if (result.user.id === currentUser.id) {
        onUserUpdate(result.user);
        window.sessionStorage.setItem('fis_user', JSON.stringify(result.user));
      }
      setUserMessage({ type: 'success', text: 'Account updated successfully.' });
      setUserForm((current) => ({ ...current, password: '' }));
    } catch (saveError) {
      setUserMessage({ type: 'error', text: saveError.message });
    } finally {
      setUserSaving(false);
    }
  };

  useEffect(() => {
    // The dashboard fetch updates local state after the effect starts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDashboard();
  }, [loadDashboard]);

  const stats = inquiryData.stats;
  const recentInquiries = inquiryData.inquiries.slice(0, 4);
  const recentNews = news.slice(0, 3);

  const navigate = (event, page) => {
    event.preventDefault();
    onNavigate(page);
  };

  return (
    <main className="dashboard-shell admin-page-shell">
      <AdminSidebar activePage="admin" currentUser={currentUser} onNavigate={onNavigate} onLogout={onLogout} inquiryCount={stats.new} />

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div><p className="dashboard-eyebrow">Overview</p><h1>Good morning, {currentUser?.first_name || 'Admin'} <span>✦</span></h1><p>Here&apos;s what is happening across the information center today.</p></div>
          <div className="dashboard-header-actions"><button type="button" className="dashboard-search" aria-label="Search">⌕</button><button type="button" className="dashboard-notification" aria-label="Notifications">♢<i /></button><button type="button" className="dashboard-refresh" onClick={loadDashboard} disabled={isLoading}>↻ <span>{isLoading ? 'Refreshing...' : 'Refresh data'}</span></button></div>
        </header>

        {error && <div className="dashboard-alert">{error}</div>}

        <div className="dashboard-section-heading"><div><span>Performance</span><h2>Information center activity</h2></div><button type="button">This week⌄</button></div>
        <div className="dashboard-stat-grid">
          <article className="dashboard-stat-card teal"><span className="stat-icon">✉</span><div><small>Total inquiries</small><strong>{stats.total ?? '—'}</strong><em>All submitted messages</em></div></article>
          <article className="dashboard-stat-card gold"><span className="stat-icon">!</span><div><small>Needs review</small><strong>{stats.new ?? '—'}</strong><em>New messages waiting</em></div></article>
          <article className="dashboard-stat-card blue"><span className="stat-icon">◷</span><div><small>In progress</small><strong>{stats.in_progress ?? '—'}</strong><em>Currently being handled</em></div></article>
          <article className="dashboard-stat-card rose"><span className="stat-icon">✦</span><div><small>Published updates</small><strong>{news.length}</strong><em>News and events library</em></div></article>
        </div>

        <div className="dashboard-content-grid">
          <section className="dashboard-panel activity-panel chart-panel">
            <div className="dashboard-panel-heading"><div><span>Inquiries overview</span><h2>Message volume</h2></div><span className="chart-legend"><i /> Received <i /> Resolved</span></div>
            <div className="dashboard-chart"><div className="chart-y-axis"><span>100</span><span>75</span><span>50</span><span>25</span><span>0</span></div><div className="chart-plot"><div className="chart-gridlines"><i /><i /><i /><i /><i /></div><svg viewBox="0 0 700 230" role="img" aria-label="Message volume trend"><defs><linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#a744ff" stopOpacity=".32" /><stop offset="1" stopColor="#a744ff" stopOpacity="0" /></linearGradient></defs><path className="chart-area" d="M0 178 C50 145 70 160 115 145 S175 115 220 135 S280 90 330 112 S390 150 440 112 S505 96 550 72 S625 82 700 38 L700 230 L0 230Z" /><path className="chart-line purple" d="M0 178 C50 145 70 160 115 145 S175 115 220 135 S280 90 330 112 S390 150 440 112 S505 96 550 72 S625 82 700 38" /><path className="chart-line cyan" d="M0 195 C55 180 78 185 115 177 S172 150 220 170 S280 132 330 152 S397 169 440 140 S510 130 550 110 S620 123 700 80" /></svg><div className="chart-x-axis"><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span></div></div></div>
          </section>
          <section className="dashboard-panel activity-panel">
            <div className="dashboard-panel-heading"><div><span>Inbox activity</span><h2>Recent inquiries</h2></div><a href="/admin/inquiries" onClick={(event) => navigate(event, 'adminInquiries')}>View all <b>→</b></a></div>
            {recentInquiries.length === 0 ? <div className="dashboard-empty">No inquiries have been submitted yet.</div> : <div className="dashboard-activity-list">{recentInquiries.map((inquiry) => <a className="dashboard-activity-row" href="/admin/inquiries" onClick={(event) => navigate(event, 'adminInquiries')} key={inquiry.id}><span className={`activity-avatar ${inquiry.priority}`}>{inquiry.full_name?.charAt(0) || '?'}</span><span className="activity-copy"><strong>{inquiry.subject}</strong><small>{inquiry.full_name} · {formatDate(inquiry.created_at)}</small></span><span className={`dashboard-status ${inquiry.status}`}>{statusLabels[inquiry.status] || inquiry.status}</span><b className="row-arrow">›</b></a>)}</div>}
          </section>

          <section className="dashboard-panel quick-panel">
            <div className="dashboard-panel-heading"><div><span>Shortcuts</span><h2>Quick actions</h2></div></div>
            <div className="dashboard-quick-actions"><a href="/admin/fish-forecast" onClick={(event) => navigate(event, 'adminFishForecast')}><span className="quick-icon teal-icon">◉</span><span><strong>Create tuna forecast</strong><small>Upload today&apos;s ocean layers</small></span><b>→</b></a><a href="/admin/news" onClick={(event) => navigate(event, 'adminNews')}><span className="quick-icon teal-icon">✦</span><span><strong>Publish an update</strong><small>Share news or an advisory</small></span><b>→</b></a><a href="/admin/inquiries" onClick={(event) => navigate(event, 'adminInquiries')}><span className="quick-icon blue-icon">✉</span><span><strong>Review inbox</strong><small>Manage incoming requests</small></span><b>→</b></a><a href="/" target="_blank" rel="noreferrer"><span className="quick-icon gold-icon">↗</span><span><strong>Open public website</strong><small>Preview the visitor experience</small></span><b>→</b></a></div>
          </section>
        </div>

        <section className="dashboard-panel publications-panel">
          <div className="dashboard-panel-heading"><div><span>Content studio</span><h2>Latest publications</h2></div><a href="/admin/news">Manage library <b>→</b></a></div>
          {recentNews.length === 0 ? <div className="dashboard-empty">No news updates have been published yet.</div> : <div className="dashboard-publications">{recentNews.map((item) => { const imageUrls = getNewsImageUrls(item.image_url); let imageIndex = 0; return <a href="/admin/news" className="dashboard-publication" key={item.id}><div className="publication-image">{item.image_url ? <img src={imageUrls[imageIndex]} alt="" onError={(event) => { imageIndex += 1; event.currentTarget.onerror = imageIndex < imageUrls.length - 1 ? event.currentTarget.onerror : null; event.currentTarget.src = imageUrls[imageIndex] || DEFAULT_NEWS_IMAGE; }} /> : '✦'}</div><div><span>{item.category} · {formatDate(item.published_at)}</span><h3>{item.title}</h3><p>{item.content}</p></div></a>; })}</div>}
        </section>
        <section className="dashboard-panel admin-users-panel">
          <div className="dashboard-panel-heading"><div><span>Account administration</span><h2>User and admin data management</h2></div><span>{users.length} accounts</span></div>
          <div className="admin-users-layout">
            <div className="admin-user-list">
              {users.map((user) => <button type="button" className={`admin-user-row ${selectedUserId === user.id ? 'selected' : ''}`} key={user.id} onClick={() => selectUser(user)}><span className="admin-user-avatar">{user.first_name?.charAt(0) || '?'}</span><span><strong>{user.first_name} {user.last_name}</strong><small>{user.email}</small></span><b>{user.role}</b></button>)}
            </div>
            {userForm ? <form className="admin-user-edit-form" onSubmit={saveUser}><div className="admin-user-edit-heading"><strong>Edit account</strong><button type="button" onClick={() => setUserForm(null)}>Close</button></div><label>First name<input value={userForm.firstName} onChange={(event) => setUserForm({ ...userForm, firstName: event.target.value })} required /></label><label>Last name<input value={userForm.lastName} onChange={(event) => setUserForm({ ...userForm, lastName: event.target.value })} required /></label><label>Email<input type="email" value={userForm.email} onChange={(event) => setUserForm({ ...userForm, email: event.target.value })} required /></label><label>Contact<input value={userForm.contact} onChange={(event) => setUserForm({ ...userForm, contact: event.target.value.replace(/\D/g, '').slice(0, 10) })} pattern="\d{10}" required /></label><label>Role<select value={userForm.role} onChange={(event) => setUserForm({ ...userForm, role: event.target.value })}><option value="user">User</option><option value="admin">Admin</option></select></label><label>New password <small>(optional)</small><input type="password" value={userForm.password} onChange={(event) => setUserForm({ ...userForm, password: event.target.value })} minLength="8" placeholder="Leave blank to keep current" /></label>{userMessage.text && <p className={`admin-user-message ${userMessage.type}`} role="alert">{userMessage.text}</p>}<button className="admin-profile-save" type="submit" disabled={userSaving}>{userSaving ? 'Saving...' : 'Save account'}</button></form> : <div className="admin-user-empty">Select an account to update its profile, role, or password.</div>}
          </div>
        </section>
      </section>
    </main>
  );
}
