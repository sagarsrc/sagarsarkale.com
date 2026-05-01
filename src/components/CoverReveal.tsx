"use client";

import { useState, useCallback } from "react";

interface CoverRevealProps {
  coverSrc: string;
  revealSrc: string;
  alt: string;
}

export function CoverReveal({ coverSrc, revealSrc, alt }: CoverRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [pressed, setPressed] = useState(false);

  const toggle = useCallback(() => {
    setRevealed((prev) => !prev);
  }, []);

  const handlePointerDown = useCallback(() => {
    setPressed(true);
  }, []);

  const handlePointerUp = useCallback(() => {
    setPressed(false);
  }, []);

  return (
    <button
      onClick={toggle}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
      className={`cover-reveal-wrapper ${pressed ? "is-pressed" : ""}`}
      aria-label={revealed ? "Show cover image" : "Reveal profile image"}
    >
      <div className="cover-reveal-inner">
        {/* Profile image behind */}
        <img
          src={revealSrc}
          alt="Sagar Sarkale"
          className="cover-reveal-profile"
        />
        {/* Cover image on top with fade */}
        <img
          src={coverSrc}
          alt={alt}
          className={`cover-reveal-cover ${revealed ? "is-revealed" : ""}`}
        />
      </div>
    </button>
  );
}
