import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const { isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading) {
      if (typeof window !== 'undefined') {
         setTimeout(() => {
            navigate('/');
         }, 800);
      }
    }
  }, [isLoading, navigate]);

  return (
    <div className="fixed inset-0 bg-[#111214] flex flex-col items-center justify-center z-50 overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display pointer-events-none mt-4 text-[rgba(168,178,188,0.04)] leading-none text-[clamp(10rem,25vw,30rem)] whitespace-nowrap">
        WELCOME
      </div>
      <div className="relative z-10 flex flex-col items-center gap-6">
        <h1 className="font-display italic text-[clamp(2.5rem,6vw,5rem)] text-[#a8b2bc] m-0 leading-none">
          CoverageIQ
        </h1>
        <div className="w-[80px] h-px bg-[#a8b2bc] animate-pulse-line"></div>
        <div className="font-mono text-[0.5rem] tracking-[0.3em] uppercase text-[#7a8290]">
          SETTING UP YOUR SESSION
        </div>
      </div>
    </div>
  );
}
