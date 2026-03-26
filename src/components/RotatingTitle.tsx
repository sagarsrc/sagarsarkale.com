'use client';

import { useEffect, useState } from 'react';

const roles = ['consultant', 'engineer', 'founder'];

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
        className="rotating-title"
        style={{
          opacity: fade ? 1 : 0,
          transition: 'opacity 0.3s ease',
        }}
      >
        {roles[index]}
      </span>
    </span>
  );
}
