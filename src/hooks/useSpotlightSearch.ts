import { useState, useEffect } from 'react';

export function useSpotlightSearch() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const openSpotlight = () => setIsOpen(true);
  const closeSpotlight = () => setIsOpen(false);

  return {
    isOpen,
    openSpotlight,
    closeSpotlight
  };
} 