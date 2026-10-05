import { useCallback, useEffect, useState } from 'react';
import FISHeader from '../components/FISHeader';
import FISFooter from '../components/FISFooter';
import './NewsPage.css';
import { DEFAULT_NEWS_IMAGE, getNewsImageUrl } from '../utils/newsImage';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function NewsPage({ onNavigate }) {
  const [news, setNews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const loadNews = useCallback(async () => {
    try {
      const response = await fetch(`${apiUrl}/api/news?limit=24`);
      const result = await response.json();
      if (response.ok) setNews(result.news || []);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { const timer = window.setTimeout(loadNews, 0); return () => window.clearTimeout(timer); }, [loadNews]);

  return <div className="public-news"><FISHeader page="news" onNavigate={onNavigate} /><main><section className="news-hero fics-page-banner"><div className="fics-page-banner-inner"><div className="fics-page-banner-eyebrow">Fisheries Information Center</div><h1>News &amp; events</h1><p className="fics-page-banner-copy">Updates, advisories, research releases, and events from Sri Lanka&apos;s fisheries information network.</p></div></section><section className="news-archive"><div className="news-archive-heading"><div><span>From the newsroom</span><h2>Latest updates</h2></div><button type="button" onClick={() => onNavigate('home')}>Back to home</button></div>{isLoading ? <div className="archive-empty">Loading the latest updates...</div> : news.length === 0 ? <div className="archive-empty">No updates have been published yet.</div> : <div className="archive-grid">{news.map((item) => { const isExpanded = expandedId === item.id; return <article className={`archive-card ${isExpanded ? 'expanded' : ''}`} key={item.id}><img src={getNewsImageUrl(item.image_url)} alt="" onError={(event) => { event.currentTarget.onerror = null; event.currentTarget.src = DEFAULT_NEWS_IMAGE; }} /><div className="archive-card-body"><div className="archive-meta"><span>{item.category}</span><time>{new Date(item.published_at).toLocaleDateString('en', { day: '2-digit', month: 'short', year: 'numeric' })}</time></div><h3>{item.title}</h3><p className={isExpanded ? 'expanded-copy' : ''}>{item.content}</p><button type="button" className="read-more" onClick={() => setExpandedId(isExpanded ? null : item.id)} aria-expanded={isExpanded}>{isExpanded ? 'Show less' : 'Read more'} <span aria-hidden="true">{isExpanded ? '↑' : '↗'}</span></button></div></article>; })}</div>}</section></main><FISFooter onNavigate={onNavigate} /></div>;
}