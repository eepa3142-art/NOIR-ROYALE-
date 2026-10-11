import React, { useEffect, useState } from 'react';

export const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [trailerPosition, setTrailerPosition] = useState({ x: -100, y: -100 });
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only enable on desktop mouse/fine pointer devices
    const isFinePointer = window.matchMedia('(pointer: fine)').matches;
    if (!isFinePointer) return;

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      const target = e.target as HTMLElement | null;
      if (target) {
        const isInteractive = Boolean(
          target.closest('a') ||
          target.closest('button') ||
          target.closest('input') ||
          target.closest('select') ||
          target.closest('textarea') ||
          target.hasAttribute('role')
        );
        setIsHovering(isInteractive);
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.body.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.body.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isVisible]);

  // Smooth trailing effect using requestAnimationFrame
  useEffect(() => {
    let animationFrameId: number;

    const animateTrailer = () => {
      setTrailerPosition((prev) => ({
        x: prev.x + (position.x - prev.x) * 0.18,
        y: prev.y + (position.y - prev.y) * 0.18,
      }));
      animationFrameId = requestAnimationFrame(animateTrailer);
    };

    animationFrameId = requestAnimationFrame(animateTrailer);
    return () => cancelAnimationFrame(animationFrameId);
  }, [position]);

  if (!isVisible) return null;

  return (
    <>
      {/* Inner Gold Precision Dot */}
      <div
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-[#D4AF37] pointer-events-none z-[9999] transition-transform duration-75"
        style={{
          transform: `translate3d(${position.x - 4}px, ${position.y - 4}px, 0) scale(${isHovering ? 1.6 : 1})`,
        }}
      />

      {/* Outer Subtle Floating Ring */}
      <div
        className="fixed top-0 left-0 w-8 h-8 rounded-full border border-[#D4AF37]/40 pointer-events-none z-[9998] transition-all duration-150"
        style={{
          transform: `translate3d(${trailerPosition.x - 16}px, ${trailerPosition.y - 16}px, 0) scale(${isHovering ? 1.5 : 1})`,
          backgroundColor: isHovering ? 'rgba(212, 175, 55, 0.08)' : 'transparent',
        }}
      />
    </>
  );
};
