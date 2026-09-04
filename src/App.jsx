import { useEffect, useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import About from './components/About';
import FISHomePage from './pages/FISHomePage';
import FISContactPage from './pages/FISContactPage';

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

  return <FISHomePage onNavigate={handleNavigate} />;
}

export default App;
