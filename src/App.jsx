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
import FishForecastPage from './pages/FishForecastPage';
import AdminFishForecastPage from './pages/AdminFishForecastPage';

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
  admin: '/admin',
  about: '/about',
  contact: '/contact',
  services: '/services',
  fishForecast: '/services/fish-forecast',
  weeklySummary: '/services/fish-forecast/weekly-summary',
  news: '/news',
  adminInquiries: '/admin/inquiries',
  adminNews: '/admin/news',
  adminFishForecast: '/admin/fish-forecast',
};
const adminPages = new Set(['admin', 'adminInquiries', 'adminNews', 'adminFishForecast']);

const pageFromPath = (pathname) => {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const page = Object.keys(pagePaths).find((key) => pagePaths[key] === normalizedPath);
  return page || 'home';
};

function App() {
  const [page, setPage] = useState(() => pageFromPath(window.location.pathname));
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const savedUser = window.sessionStorage.getItem('fis_user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });

  const handleNavigate = (nextPage) => {
    const isAdminRoute = currentUser?.role === 'admin';

    if (isAdminRoute && !adminPages.has(nextPage)) {
      window.history.pushState({}, '', pagePaths.admin);
      setPage('admin');
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    const nextPath = pagePaths[nextPage] || pagePaths.home;
    window.history.pushState({}, '', nextPath);
    setPage(nextPage);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user?.role === 'admin') {
      handleNavigate('admin');
      return;
    }
    handleNavigate('home');
  };

  const handleLogout = () => {
    window.sessionStorage.removeItem('fis_token');
    window.sessionStorage.removeItem('fis_user');
    setCurrentUser(null);
    window.history.pushState({}, '', pagePaths.home);
    setPage('home');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  useEffect(() => {
    const handlePopState = () => {
      if (currentUser?.role === 'admin') {
        const nextPage = pageFromPath(window.location.pathname);
        if (!adminPages.has(nextPage)) {
          window.history.pushState({}, '', pagePaths.admin);
          setPage('admin');
          return;
        }
        setPage(nextPage);
        return;
      }

      setPage(pageFromPath(window.location.pathname));
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentUser]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [page]);

  if (page === 'login') return <Login onNavigate={handleNavigate} onLoginSuccess={handleLoginSuccess} />;
  if (page === 'signup') return <Signup onNavigate={handleNavigate} />;
  if (adminPages.has(page)) {
    if (!currentUser || currentUser.role !== 'admin') {
      return <FISHomePage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />;
    }
    if (page === 'admin') {
      return <AdminDashboardPage currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    }
    if (page === 'adminFishForecast') return <AdminFishForecastPage currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
    if (page === 'adminInquiries') return <AdminInquiriesPage onNavigate={handleNavigate} />;
    return <AdminNewsPage onNavigate={handleNavigate} />;
  }
  if (page === 'about') return <About onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />;
  if (page === 'contact') return <FISContactPage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />;
  if (page === 'news') return <NewsPage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />;
  if (page === 'fishForecast') return <FishForecastPage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />;
  if (page === 'weeklySummary') return <FishForecastPage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} weeklySummary />;
  if (sectionPages[page]) {
    return <FISSectionPage page={page} {...sectionPages[page]} onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />;
  }

  return <FISHomePage onNavigate={handleNavigate} currentUser={currentUser} onLogout={handleLogout} />;
}

export default App;
