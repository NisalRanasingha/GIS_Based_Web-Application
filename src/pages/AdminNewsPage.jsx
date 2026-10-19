import { useCallback, useEffect, useState } from 'react';
import './AdminNewsPage.css';
import { getNewsImageUrl } from '../utils/newsImage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const emptyForm = { title: '', category: 'News', content: '', imageUrl: '', publishedAt: '' };

const formatDate = (value) => new Intl.DateTimeFormat('en', { dateStyle: 'medium' }).format(new Date(value));

export default function AdminNewsPage({ onNavigate }) {
  const [news, setNews] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadNews = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${apiUrl}/api/admin/news`);
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to load news.');
      setNews(result.news || []);
    } catch (error) { setFeedback(error.message); } finally { setIsLoading(false); }
  }, []);

  useEffect(() => {
    const refreshTimer = window.setTimeout(loadNews, 0);
    return () => window.clearTimeout(refreshTimer);
  }, [loadNews]);

  const updateForm = (event) => setForm({ ...form, [event.target.name]: event.target.value });

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFeedback('');
    try {
      const response = await fetch(`${apiUrl}/api/admin/news${editingId ? `/${editingId}` : ''}`, {
        method: editingId ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, publishedAt: form.publishedAt ? new Date(form.publishedAt).toISOString() : undefined }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Unable to save news.');
      setFeedback(editingId ? 'News item updated.' : 'News item published.');
      setForm(emptyForm); setEditingId(null); await loadNews();
    } catch (error) { setFeedback(error.message); }
  };

  const editNews = (item) => setForm({ title: item.title, category: item.category, content: item.content, imageUrl: item.image_url || '', publishedAt: item.published_at ? new Date(item.published_at).toISOString().slice(0, 16) : '' }) || setEditingId(item.id);

  const deleteNews = async (item) => {
    if (!window.confirm(`Delete “${item.title}”?`)) return;
    const response = await fetch(`${apiUrl}/api/admin/news/${item.id}`, { method: 'DELETE' });
    if (response.ok) { setFeedback('News item deleted.'); await loadNews(); }
  };

  return <main className="news-admin"><header className="news-admin-header"><div><span className="news-admin-kicker">Content studio</span><h1>News &amp; events</h1><p>Publish the updates that appear on the public home page.</p></div><div className="news-header-actions"><a href="/admin" className="news-refresh" onClick={(event) => { event.preventDefault(); onNavigate('admin'); }}>Dashboard</a><button type="button" className="news-refresh" onClick={loadNews}>Refresh</button></div></header>
    {feedback && <div className="news-feedback">{feedback}</div>}
    <div className="news-admin-grid"><form className="news-form" onSubmit={handleSubmit}><div className="form-heading"><div><span>{editingId ? 'Edit update' : 'New update'}</span><h2>{editingId ? 'Refine publication' : 'Add a publication'}</h2></div>{editingId && <button type="button" className="cancel-edit" onClick={() => { setEditingId(null); setForm(emptyForm); }}>Cancel</button>}</div>
      <label>Headline<input name="title" value={form.title} onChange={updateForm} required maxLength="220" placeholder="Enter a clear headline" /></label>
      <div className="form-row"><label>Category<input name="category" value={form.category} onChange={updateForm} required maxLength="60" placeholder="News, Event, Advisory" /></label><label>Publish date<input type="datetime-local" name="publishedAt" value={form.publishedAt} onChange={updateForm} /></label></div>
      <label>Image URL<input type="url" name="imageUrl" value={form.imageUrl} onChange={updateForm} placeholder="https://..." /></label>
      <label>News content<textarea name="content" value={form.content} onChange={updateForm} required minLength="10" maxLength="5000" rows="7" placeholder="Share the essential details..." /></label>
      <button className="publish-button" type="submit">{editingId ? 'Save changes' : 'Publish update'} <span aria-hidden="true">→</span></button>
    </form>
    <section className="news-list-panel"><div className="list-heading"><div><span>Published library</span><h2>{news.length} updates</h2></div></div>{isLoading ? <p className="news-empty">Loading publications...</p> : news.length === 0 ? <p className="news-empty">No publications yet. Add the first update.</p> : <div className="news-admin-list">{news.map((item) => <article className="news-admin-item" key={item.id}><div className="news-thumb">{item.image_url ? <img src={getNewsImageUrl(item.image_url)} alt="" /> : <span>✦</span>}</div><div className="news-admin-copy"><span>{item.category} · {formatDate(item.published_at)}</span><h3>{item.title}</h3><p>{item.content}</p><div><button type="button" onClick={() => editNews(item)}>Edit</button><button type="button" className="danger" onClick={() => deleteNews(item)}>Delete</button></div></div></article>)}</div>}</section></div>
  </main>;
}