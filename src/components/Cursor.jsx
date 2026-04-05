import { useEffect, useState } from 'react';

export default function Cursor() {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(() => {
    const handleMove = (e) => setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', handleMove);
    return () => window.removeEventListener('pointermove', handleMove);
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-[999] opacity-90 transition-transform duration-75 ease-out"
      style={{ left: pos.x, top: pos.y, transform: 'translate(-50%, -50%)' }}
    >
      <svg width="16" height="24" viewBox="0 0 16 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 0L16 12L8 24L0 12L8 0Z" fill="var(--green)" />
        <path d="M8 4L12 12L8 20L4 12L8 4Z" fill="#a8ff78" opacity="0.9" />
      </svg>
    </div>
  );
}
