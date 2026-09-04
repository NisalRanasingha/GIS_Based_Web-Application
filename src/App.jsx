import { useEffect, useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import About from './components/About';
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

function App() {
  const [page, setPage] = useState('home');

  const handleNavigate = (nextPage) => {
    setPage(nextPage);
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  };

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [page]);

  if (page === 'login') return <Login onNavigate={handleNavigate} />;
  if (page === 'signup') return <Signup onNavigate={handleNavigate} />;
  if (page === 'about') return <About onNavigate={handleNavigate} />;
  if (page === 'contact') return <FISContactPage onNavigate={handleNavigate} />;
  if (sectionPages[page]) return <FISSectionPage page={page} {...sectionPages[page]} onNavigate={handleNavigate} />;

  return <FISHomePage onNavigate={handleNavigate} />;
}

export default App;
