'use client';

import { useEffect, useState } from 'react';

const roles = ['founder', 'engineer', 'consultant', 'contractor'];

export function RotatingTitle() {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % roles.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <span>
      ai{' '}
      <span
        className={`inline-block min-w-[11ch] transition-opacity duration-300 ease-in-out ${fade ? 'opacity-100' : 'opacity-0'}`}
      >
        {roles[index]}
      </span>
    </span>
  );
}
