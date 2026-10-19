import { useCallback, useEffect, useState } from 'react';
import './AdminDashboardPage.css';
import logo from '../assets/FISlogo.png';
import { getNewsImageUrl } from '../utils/newsImage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const statusLabels = { new: 'New', in_progress: 'In progress', resolved: 'Resolved' };
const formatDate = (value) => new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(value));

export default function AdminDashboardPage({ onNavigate }) {
  const [inquiryData, setInquiryData] = useState({ inquiries: [], stats: {} });
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const [inquiryResponse, newsResponse] = await Promise.all([
        fetch(`${apiUrl}/api/admin/inquiries`),
        fetch(`${apiUrl}/api/admin/news`),
      ]);
      const inquiryResult = await inquiryResponse.json().catch(() => ({}));
      const newsResult = await newsResponse.json().catch(() => ({}));
      if (!inquiryResponse.ok) throw new Error(inquiryResult.message || 'Unable to load inquiry data.');
      if (!newsResponse.ok) throw new Error(newsResult.message || 'Unable to load news data.');
      setInquiryData({ inquiries: inquiryResult.inquiries || [], stats: inquiryResult.stats || {} });
      setNews(newsResult.news || []);
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    <main className="dashboard-shell">
      <aside className="dashboard-sidebar">
        <a className="dashboard-brand" href="/admin">
          <img src={logo} alt="" />
          <span><strong>FIS Admin</strong><small>Fisheries Information Center</small></span>
        </a>
        <nav className="dashboard-nav" aria-label="Admin navigation">
          <a className="active" href="/admin" onClick={(event) => navigate(event, 'admin')}><span>▦</span>Overview</a>
            <a href="/admin/inquiries" onClick={(event) => navigate(event, 'adminInquiries')}><span>✉</span>Inquiries{stats.new > 0 && <b>{stats.new}</b>}</a>
            <a href="/admin/news" onClick={(event) => navigate(event, 'adminNews')}><span>✦</span>News &amp; events</a>
          <a href="/" target="_blank" rel="noreferrer"><span>↗</span>View public site</a>
        </nav>
        <div className="dashboard-sidebar-footer"><span className="dashboard-online" />System operational<a href="/">Sign out</a></div>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-header">
          <div><p className="dashboard-eyebrow">Administration / Overview</p><h1>Good morning, Admin</h1><p>Here&apos;s what is happening across the information center today.</p></div>
          <button type="button" className="dashboard-refresh" onClick={loadDashboard} disabled={isLoading}>↻ <span>{isLoading ? 'Refreshing...' : 'Refresh data'}</span></button>
        </header>

        {error && <div className="dashboard-alert">{error}</div>}

        <div className="dashboard-stat-grid">
          <article className="dashboard-stat-card teal"><span className="stat-icon">✉</span><div><small>Total inquiries</small><strong>{stats.total ?? '—'}</strong><em>All submitted messages</em></div></article>
          <article className="dashboard-stat-card gold"><span className="stat-icon">!</span><div><small>Needs review</small><strong>{stats.new ?? '—'}</strong><em>New messages waiting</em></div></article>
          <article className="dashboard-stat-card blue"><span className="stat-icon">◷</span><div><small>In progress</small><strong>{stats.in_progress ?? '—'}</strong><em>Currently being handled</em></div></article>
          <article className="dashboard-stat-card rose"><span className="stat-icon">✦</span><div><small>Published updates</small><strong>{news.length}</strong><em>News and events library</em></div></article>
        </div>

        <div className="dashboard-content-grid">
          <section className="dashboard-panel activity-panel">
            <div className="dashboard-panel-heading"><div><span>Inbox activity</span><h2>Recent inquiries</h2></div><a href="/admin/inquiries" onClick={(event) => navigate(event, 'adminInquiries')}>View all <b>→</b></a></div>
            {recentInquiries.length === 0 ? <div className="dashboard-empty">No inquiries have been submitted yet.</div> : <div className="dashboard-activity-list">{recentInquiries.map((inquiry) => <a className="dashboard-activity-row" href="/admin/inquiries" onClick={(event) => navigate(event, 'adminInquiries')} key={inquiry.id}><span className={`activity-avatar ${inquiry.priority}`}>{inquiry.full_name?.charAt(0) || '?'}</span><span className="activity-copy"><strong>{inquiry.subject}</strong><small>{inquiry.full_name} · {formatDate(inquiry.created_at)}</small></span><span className={`dashboard-status ${inquiry.status}`}>{statusLabels[inquiry.status] || inquiry.status}</span><b className="row-arrow">›</b></a>)}</div>}
          </section>

          <section className="dashboard-panel quick-panel">
            <div className="dashboard-panel-heading"><div><span>Shortcuts</span><h2>Quick actions</h2></div></div>
            <div className="dashboard-quick-actions"><a href="/admin/news" onClick={(event) => navigate(event, 'adminNews')}><span className="quick-icon teal-icon">✦</span><span><strong>Publish an update</strong><small>Share news or an advisory</small></span><b>→</b></a><a href="/admin/inquiries" onClick={(event) => navigate(event, 'adminInquiries')}><span className="quick-icon blue-icon">✉</span><span><strong>Review inbox</strong><small>Manage incoming requests</small></span><b>→</b></a><a href="/" target="_blank" rel="noreferrer"><span className="quick-icon gold-icon">↗</span><span><strong>Open public website</strong><small>Preview the visitor experience</small></span><b>→</b></a></div>
          </section>
        </div>

        <section className="dashboard-panel publications-panel">
          <div className="dashboard-panel-heading"><div><span>Content studio</span><h2>Latest publications</h2></div><a href="/admin/news">Manage library <b>→</b></a></div>
          {recentNews.length === 0 ? <div className="dashboard-empty">No news updates have been published yet.</div> : <div className="dashboard-publications">{recentNews.map((item) => <a href="/admin/news" className="dashboard-publication" key={item.id}><div className="publication-image">{item.image_url ? <img src={getNewsImageUrl(item.image_url)} alt="" /> : '✦'}</div><div><span>{item.category} · {formatDate(item.published_at)}</span><h3>{item.title}</h3><p>{item.content}</p></div></a>)}</div>}
        </section>
      </section>
    </main>
  );
}
