import { useEffect, useState } from 'react';

export default function ScrollDownPrompt() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => setIsVisible(window.scrollY <= 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollDown = () => {
    window.scrollBy({ top: Math.max(window.innerHeight * 0.72, 420), left: 0, behavior: 'smooth' });
  };

  return (
    <button
      type="button"
      className={`scroll-down-prompt ${isVisible ? '' : 'scroll-down-prompt-hidden'}`}
      onClick={scrollDown}
      aria-label="Scroll to explore"
      tabIndex={isVisible ? 0 : -1}
    >
      <span>Scroll to explore</span>
      <span className="scroll-down-prompt-icon" aria-hidden="true"><span /></span>
    </button>
  );
}
