'use client';

import { useEffect, useState } from 'react';

/** Ambient local-time line (leo.here-inspired, tuned to this site's mono register). */
export function AmbientLine() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Kolkata',
    });
    const tick = () => setTime(formatter.format(new Date()));
    tick();
    const id = setInterval(tick, 15000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null; // avoid SSR/client hydration mismatch

  return (
    <span className="text-[0.8125rem] font-mono text-[var(--fg-muted)] tabular-nums lowercase whitespace-nowrap" title="pune, ist">
      pune&thinsp;&middot;&thinsp;{time}
    </span>
  );
}
