import { useEffect, useState } from 'react';

const COLORS = ['#39FF14', '#a8ff78', '#00D4FF', '#FFE600', '#9B5DE5'];
const CHARS = ['§', '✦'];

export default function Particles() {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    let idCounter = 0;

    const spawn = (x, y) => {
      const char = CHARS[Math.floor(Math.random() * CHARS.length)];
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur = 1.5 + Math.random();
      const delay = Math.random() * 0.2;
      
      const pId = idCounter++;
      const xp = x + (Math.random() - 0.5) * 60;
      const yp = y + (Math.random() - 0.5) * 60;
      
      const p = {
        id: pId,
        char,
        style: {
          '--d': `${dur}s`,
          '--dl': `${delay}s`,
          left: `${xp}px`,
          top: `${yp}px`,
          color
        }
      };
      
      setParticles(prev => [...prev, p]);
      
      setTimeout(() => {
        setParticles(prev => prev.filter(item => item.id !== pId));
      }, (dur + delay) * 1000);
    };

    const handleClick = (e) => {
      for (let i = 0; i < 12; i++) {
        spawn(e.clientX, e.clientY);
      }
    };

    const ambientInterval = setInterval(() => {
      const width = typeof window !== 'undefined' ? window.innerWidth : 1000;
      const height = typeof window !== 'undefined' ? window.innerHeight : 1000;
      const x = Math.random() * width;
      const y = height / 2 + Math.random() * (height / 2);
      spawn(x, y);
    }, 420);

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      clearInterval(ambientInterval);
    };
  }, []);

  return (
    <>
      {particles.map(p => (
        <div key={p.id} className="pt" style={p.style}>
          {p.char}
        </div>
      ))}
    </>
  );
}
