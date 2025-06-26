import React, { useRef, useEffect, useState } from 'react';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number; // Delay in milliseconds before the animation starts
  duration?: number; // Duration of the animation in milliseconds
  distance?: string; // Distance to move the element (e.g., '20px', '50px')
  origin?: 'top' | 'bottom' | 'left' | 'right'; // Direction from which the element appears
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  duration = 800,
  distance = '20px',
  origin = 'bottom',
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Optionally, unobserve after it becomes visible if you only want it to animate once
          // observer.unobserve(entry.target);
        }
      },
      {
        root: null, // viewport
        rootMargin: '0px',
        threshold: 0.1, // 10% of the target element is visible
      }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    // Cleanup function: Disconnect observer when component unmounts
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
      observer.disconnect();
    };
  }, []); // Empty dependency array ensures this runs once on mount and cleans up on unmount

  const getTransform = () => {
    if (isVisible) return 'translate(0, 0)';
    switch (origin) {
      case 'top': return `translateY(-${distance})`;
      case 'bottom': return `translateY(${distance})`;
      case 'left': return `translateX(-${distance})`;
      case 'right': return `translateX(${distance})`;
      default: return 'translate(0, 0)';
    }
  };

  const getOpacity = () => (isVisible ? 1 : 0);

  return (
    <div
      ref={ref}
      style={{
        opacity: getOpacity(),
        transform: getTransform(),
        transition: `opacity ${duration}ms ease-out ${delay}ms, transform ${duration}ms ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default ScrollReveal;
