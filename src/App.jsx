import { useEffect, useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import About from './components/About';
import AdminDashboard from './components/AdminDashboard';
import FISHomePage from './pages/FISHomePage';
import FISContactPage from './pages/FISContactPage';
import FISSectionPage from './pages/FISSectionPage';

const sectionPages = {
  services: {
    title: 'Services',
    description: 'Explore the information, research, and advisory services provided by the Fisheries Information Center.',
  },
  research: {
    title: 'Research',
    description: 'Discover research programs and scientific findings supporting Sri Lanka\'s aquatic resources.',
  },
  publications: {
    title: 'Publications',
    description: 'Browse reports, journals, statistics, and technical publications from NARA.',
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
  research: '/research',
  publications: '/publications',
  news: '/news',
};

const pageFromPath = (pathname) => {
  const page = Object.keys(pagePaths).find((key) => pagePaths[key] === pathname);
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

    if (isAdminRoute && nextPage !== 'admin') {
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
    handleNavigate('home');
  };

  useEffect(() => {
    const handlePopState = () => {
      if (currentUser?.role === 'admin') {
        window.history.pushState({}, '', pagePaths.admin);
        setPage('admin');
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
  if (page === 'admin') {
    if (!currentUser || currentUser.role !== 'admin') {
      return <FISHomePage onNavigate={handleNavigate} />;
    }
    return <AdminDashboard currentUser={currentUser} onNavigate={handleNavigate} onLogout={handleLogout} />;
  }
  if (page === 'about') return <About onNavigate={handleNavigate} />;
  if (page === 'contact') return <FISContactPage onNavigate={handleNavigate} />;
  if (sectionPages[page]) return <FISSectionPage page={page} {...sectionPages[page]} onNavigate={handleNavigate} />;

  return <FISHomePage onNavigate={handleNavigate} />;
}

export default App;
