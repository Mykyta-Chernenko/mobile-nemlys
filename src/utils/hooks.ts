import { useState, useEffect } from 'react';
import { getNow } from './date';
export function useCurrentTime() {
  const [currentTime, setCurrentTime] = useState(getNow());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentTime(getNow());
    }, 1000);

    // Clear the interval when the component is unmounted
    return () => clearInterval(intervalId);
  }, []);

  return currentTime;
}
