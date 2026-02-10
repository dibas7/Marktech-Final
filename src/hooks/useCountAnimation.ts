import { useState, useEffect, useRef } from 'react';

export function useCountAnimation(endValue: number, duration: number = 1500) {
  const [count, setCount] = useState(0);
  const [progress, setProgress] = useState(0);
  const previousEndValue = useRef(endValue);

  useEffect(() => {
    // Reset if endValue changed significantly
    if (Math.abs(previousEndValue.current - endValue) > 1) {
      previousEndValue.current = endValue;
    }

    if (endValue === 0) {
      setCount(0);
      setProgress(0);
      return;
    }

    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progressValue = Math.min(elapsed / duration, 1);
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progressValue, 4);
      
      const currentCount = Math.floor(easeOutQuart * endValue);
      setCount(currentCount);
      setProgress(progressValue * 100);

      if (progressValue < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(endValue);
        setProgress(100);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [endValue, duration]);

  return { count, progress };
}
