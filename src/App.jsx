import { useEffect, useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import About from './components/About';
import FISHomePage from './pages/FISHomePage';
import FISContactPage from './pages/FISContactPage';
import FISSectionPage from './pages/FISSectionPage';
import AdminInquiriesPage from './pages/AdminInquiriesPage';
import AdminNewsPage from './pages/AdminNewsPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import NewsPage from './pages/NewsPage';

const sectionPages = {
  services: {
    title: 'Services',
    description: 'Explore the information and advisory services provided by the Fisheries Information Center.',
  },
  news: {
    title: 'News & Events',
    description: 'Stay informed about fisheries advisories, announcements, workshops, and upcoming events.',
  },
};

const pagePaths = {
  home: '/',
  login: '/login',
  signup: '/signup',
  about: '/about',
  contact: '/contact',
  services: '/services',
  news: '/news',
  adminInquiries: '/admin/inquiries',
  adminNews: '/admin/news',
  admin: '/admin',
};

const pageFromPath = (pathname) => {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const page = Object.keys(pagePaths).find((key) => pagePaths[key] === normalizedPath);
  return page || 'home';
};

function App() {
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname));

  const handleNavigate = (nextPage) => {
    const nextPath = pagePaths[nextPage] || pagePaths.home;
    window.history.pushState({}, '', nextPath);
    setPage(nextPage);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handlePopState = () => setPage(pageFromPath(window.location.pathname));
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [page]);

  if (page === 'login') return <Login onNavigate={handleNavigate} />;
  if (page === 'signup') return <Signup onNavigate={handleNavigate} />;
  if (page === 'about') return <About onNavigate={handleNavigate} />;
  if (page === 'contact') return <FISContactPage onNavigate={handleNavigate} />;
  if (page === 'adminInquiries') return <AdminInquiriesPage onNavigate={handleNavigate} />;
  if (page === 'adminNews') return <AdminNewsPage onNavigate={handleNavigate} />;
  if (page === 'admin') return <AdminDashboardPage onNavigate={handleNavigate} />;
  if (page === 'news') return <NewsPage onNavigate={handleNavigate} />;
  if (sectionPages[page]) return <FISSectionPage page={page} {...sectionPages[page]} onNavigate={handleNavigate} />;

  return <FISHomePage onNavigate={handleNavigate} />;
}

export default App;
