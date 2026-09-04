import { useEffect, useState } from 'react';
import logo from '../assets/FISlogo.png';
import userAvatar from '../assets/user-avatar.svg';

const navItems = ['Home', 'About Us', 'Services', 'Research', 'Publications', 'News & Events', 'Contact Us'];

export default function FISHeader({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hideLoginButton = page === 'login' || page === 'signup';

  const isActive = (label) => {
    if (label === 'Home' && page === 'home') return true;
    if (label === 'About Us' && page === 'about') return true;
    if (label === 'Contact Us' && page === 'contact') return true;
    return false;
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNav = (item) => {
    if (item === 'Home') onNavigate('home');
    if (item === 'Contact Us') onNavigate('contact');
    if (item === 'About Us') onNavigate('about');
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f3f7fb] shadow-sm">
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-[70px] w-[70px] shrink-0 items-center justify-center overflow-hidden bg-transparent">
              <img src={logo} alt="FIS logo" className="h-[70px] w-[70px] object-contain" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-[#0a3d72] sm:text-[11px]">Fisheries Information Center</div>
              <div className="mt-1 text-sm font-bold text-[#103d7a] sm:text-base lg:text-[1.8rem]">
                National Aquatic Resources Research and Development Agency
              </div>
              <div className="mt-1 text-[10px] text-slate-500 sm:text-[11px]">Ministry of Fisheries, Sri Lanka</div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-[#0d3b7c]/15 bg-white text-xl text-[#0d3b7c] shadow-sm transition hover:bg-slate-50 md:hidden"
          >
            {menuOpen ? '×' : '☰'}
          </button>
        </div>
      </div>

      <nav className="bg-[#0d3b7c]">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
          <div className="hidden w-full items-center overflow-x-auto md:flex">
            {navItems.map((item) => (
              <button
                key={item}
                onClick={() => handleNav(item)}
                className={`whitespace-nowrap px-4 py-4 text-[12px] font-medium transition sm:px-5 ${
                  isActive(item)
                    ? 'border-b-2 border-[#f4b740] text-white'
                    : 'text-white/80 hover:bg-white/5 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>

          {!hideLoginButton && (
            <button
              type="button"
              onClick={() => {
                onNavigate('login');
                setMenuOpen(false);
              }}
              className="hidden shrink-0 items-center gap-2 rounded-sm border border-white/10 bg-white/5 px-2.5 py-2 text-white/90 shadow-sm transition hover:bg-white/10 md:flex"
            >
              <img src={userAvatar} alt="Login" className="h-7 w-7 rounded-full border border-[#f4b740]/80 bg-[#0a3d72] p-0.5" />
              <span className="text-[12px] font-semibold">Login</span>
            </button>
          )}
        </div>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0d3b7c] md:hidden">
            <div className="mx-auto max-w-[1440px] px-4 py-3 sm:px-6">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item}
                    onClick={() => handleNav(item)}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left text-sm font-medium transition ${
                      isActive(item) ? 'bg-white/10 text-white' : 'text-white/80 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <span>{item}</span>
                    <span className="text-xs text-[#f4b740]">›</span>
                  </button>
                ))}

                {!hideLoginButton && (
                  <button
                    type="button"
                    onClick={() => {
                      onNavigate('login');
                      setMenuOpen(false);
                    }}
                    className="mt-2 flex w-full items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-3 text-left text-sm font-semibold text-white"
                  >
                    <span className="flex items-center gap-2">
                      <img src={userAvatar} alt="Login" className="h-6 w-6 rounded-full border border-[#f4b740]/80 bg-[#0a3d72] p-0.5" />
                      Login
                    </span>
                    <span className="text-xs text-[#f4b740]">›</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
