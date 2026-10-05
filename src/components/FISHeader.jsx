import { useEffect, useState } from 'react';
import logo from '../assets/FISlogo.png';

const navItems = ['Home', 'About Us', 'Services', 'Research', 'Publications', 'News & Events', 'Contact Us'];

const pageByLabel = {
  Home: 'home',
  'About Us': 'about',
  Services: 'services',
  Research: 'research',
  Publications: 'publications',
  'News & Events': 'news',
  'Contact Us': 'contact',
};

export default function FISHeader({ page, onNavigate }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const hideLoginButton = page === 'login' || page === 'signup';

  const isActive = (label) => {
    return pageByLabel[label] === page;
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
    onNavigate(pageByLabel[item]);
    setMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#f3f7fb] shadow-sm">
      <div className="border-b border-slate-200 bg-white/70 backdrop-blur-sm">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-2 px-3 py-2.5 sm:gap-4 sm:px-6 sm:py-4 lg:px-8">
          <div className="flex min-w-0 items-center gap-2 sm:gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden bg-transparent sm:h-[70px] sm:w-[70px]">
              <img src={logo} alt="FIS logo" className="h-12 w-12 object-contain sm:h-[70px] sm:w-[70px]" />
            </div>

            <div className="min-w-0">
              <div className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.1em] text-[#0a3d72] sm:text-[11px] sm:font-extrabold sm:tracking-[0.18em]">Fisheries Information Center</div>
              <div className="mt-0.5 text-[11px] font-semibold leading-tight text-[#103d7a] sm:mt-1 sm:text-base lg:text-[1.8rem]">
                National Aquatic Resources Research and Development Agency
              </div>
              <div className="mt-0.5 text-[8px] text-slate-500 sm:mt-1 sm:text-[11px]">Ministry of Fisheries, Sri Lanka</div>
            </div>
          </div>

          <button
            type="button"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-[#0d3b7c]/15 bg-white text-lg text-[#0d3b7c] shadow-sm transition hover:bg-slate-50 md:hidden sm:h-11 sm:w-11 sm:text-xl"
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
              className="hidden shrink-0 items-center rounded-sm border border-transparent bg-transparent px-2.5 py-2 text-[13px] font-semibold text-white/90 transition hover:border-white/30 hover:text-white md:flex"
            >
              Login
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
                    className="mt-2 flex w-full items-center justify-between rounded-md border border-white/20 bg-transparent px-3 py-3 text-left text-sm font-semibold text-white"
                  >
                    <span>Login</span>
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
