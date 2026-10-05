import { useCallback, useEffect, useState } from 'react';
import './AdminInquiries.css';
import LoadingOverlay from '../components/LoadingOverlay';
import CenterAlert from '../components/CenterAlert';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const statusLabels = { new: 'New', in_progress: 'In progress', resolved: 'Resolved', archived: 'Archived' };
const priorityLabels = { low: 'Low', normal: 'Normal', high: 'High', urgent: 'Urgent' };

const formatDate = (value) => new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
  timeStyle: 'short',
}).format(new Date(value));

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState([]);
  const [stats, setStats] = useState({ total: 0, new: 0, in_progress: 0, resolved: 0, attention: 0 });
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: 'all', priority: 'all' });
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const loadInquiries = useCallback(async () => {
    setIsLoading(true);
    setFeedback(null);
    const query = new URLSearchParams(filters);
    try {
      const response = await fetch(`${apiUrl}/api/admin/inquiries?${query}`);
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Unable to load inquiries.');
      setInquiries(result.inquiries || []);
      setStats(result.stats || {});
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const refreshTimer = window.setTimeout(() => loadInquiries(), 0);
    return () => window.clearTimeout(refreshTimer);
  }, [loadInquiries]);

  const updateInquiry = async (id, changes) => {
    const response = await fetch(`${apiUrl}/api/admin/inquiries/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(changes),
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.message || 'Unable to update inquiry.');
    setSelected((current) => (current?.id === id ? { ...current, ...result.inquiry } : current));
    await loadInquiries();
  };

  const handleDelete = async (inquiry) => {
    if (!window.confirm(`Delete the inquiry “${inquiry.subject}”? This cannot be undone.`)) return;
    try {
      const response = await fetch(`${apiUrl}/api/admin/inquiries/${inquiry.id}`, {
        method: 'DELETE',
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Unable to delete inquiry.');
      setSelected(null);
      setFeedback({ type: 'success', message: 'Inquiry deleted.' });
      await loadInquiries();
    } catch (error) {
      setFeedback({ type: 'error', message: error.message });
    }
  };

  return (
    <main className="admin-app">
      {isLoading && <LoadingOverlay />}
      <CenterAlert type={feedback?.type} message={feedback?.message} onClose={() => setFeedback(null)} />
                     

      <section className="admin-content">
        <div className="admin-heading-row">
          <div><p className="admin-kicker">Operations overview</p><h1>Incoming inquiries</h1><p className="admin-subtitle">Keep every request moving to the right team.</p></div>
          <div className="admin-heading-actions"><a href="/admin/news" className="refresh-button">News manager</a><button type="button" className="refresh-button" onClick={() => loadInquiries()} disabled={isLoading}><span aria-hidden="true">↻</span> Refresh</button></div>
        </div>

        <div className="stats-grid">
          <div className="stat-card accent"><span>Total messages</span><strong>{stats.total}</strong><small>All submitted inquiries</small></div>
          <div className="stat-card"><span>Needs review</span><strong>{stats.new}</strong><small>New messages waiting</small></div>
          <div className="stat-card"><span>In progress</span><strong>{stats.in_progress}</strong><small>Currently being handled</small></div>
          <div className="stat-card"><span>Priority attention</span><strong>{stats.attention}</strong><small>High or urgent requests</small></div>
        </div>

        <section className="inbox-panel">
          <div className="inbox-toolbar">
            <div><h2>Message inbox</h2><span>{inquiries.length} visible {inquiries.length === 1 ? 'message' : 'messages'}</span></div>
            <div className="filter-controls">
              <label className="search-box"><span aria-hidden="true">⌕</span><input value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} onKeyDown={(event) => event.key === 'Enter' && loadInquiries()} placeholder="Search messages" /></label>
              <select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })} aria-label="Filter by status"><option value="all">All statuses</option>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <select value={filters.priority} onChange={(event) => setFilters({ ...filters, priority: event.target.value })} aria-label="Filter by priority"><option value="all">All priority</option>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <button type="button" className="filter-button" onClick={() => loadInquiries()} aria-label="Apply search">Apply</button>
            </div>
          </div>

          {inquiries.length === 0 ? <div className="empty-state"><span className="empty-icon">◌</span><strong>No inquiries found</strong><span>Try changing your filters or check back when a new message arrives.</span></div> : (
            <div className="inquiry-list">
              {inquiries.map((inquiry) => <button type="button" className={`inquiry-row ${selected?.id === inquiry.id ? 'selected' : ''}`} key={inquiry.id} onClick={() => setSelected(inquiry)}>
                <span className={`priority-dot ${inquiry.priority}`} aria-label={`${priorityLabels[inquiry.priority]} priority`} />
                <span className="inquiry-main"><strong>{inquiry.subject}</strong><span>{inquiry.full_name} · {inquiry.department}</span></span>
                <span className="inquiry-message">{inquiry.message}</span>
                <span className="inquiry-meta"><span className={`status-pill ${inquiry.status}`}>{statusLabels[inquiry.status]}</span><time>{formatDate(inquiry.created_at)}</time></span>
              </button>)}
            </div>
          )}
        </section>
      </section>

      {selected && <div className="detail-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelected(null)}><aside className="detail-panel" aria-label="Inquiry details">
        <div className="detail-header"><div><span className={`status-pill ${selected.status}`}>{statusLabels[selected.status]}</span><h2>{selected.subject}</h2><time>Received {formatDate(selected.created_at)}</time></div><button type="button" className="close-button" onClick={() => setSelected(null)} aria-label="Close inquiry">×</button></div>
        <div className="sender-block"><div className="avatar">{selected.full_name.charAt(0).toUpperCase()}</div><div><strong>{selected.full_name}</strong><a href={`mailto:${selected.email}`}>{selected.email}</a>{selected.organization && <span>{selected.organization}</span>}</div></div>
        <div className="detail-fields"><label>Status<select value={selected.status} onChange={(event) => updateInquiry(selected.id, { status: event.target.value }).catch((error) => setFeedback({ type: 'error', message: error.message }))}>{Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label>Priority<select value={selected.priority} onChange={(event) => updateInquiry(selected.id, { priority: event.target.value }).catch((error) => setFeedback({ type: 'error', message: error.message }))}>{Object.entries(priorityLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label></div>
        <div className="message-copy"><span>Message</span><p>{selected.message}</p></div>
        <label className="note-field">Internal note<textarea defaultValue={selected.admin_note || ''} placeholder="Add a note for your team..." onBlur={(event) => { if (event.target.value !== (selected.admin_note || '')) updateInquiry(selected.id, { adminNote: event.target.value }).catch((error) => setFeedback({ type: 'error', message: error.message })); }} /></label>
        <div className="detail-footer"><a href={`mailto:${selected.email}?subject=Re: ${selected.subject}`} className="reply-button">Reply by email <span aria-hidden="true">↗</span></a><button type="button" className="delete-button" onClick={() => handleDelete(selected)}>Delete inquiry</button></div>
      </aside></div>}
    </main>
  );
}