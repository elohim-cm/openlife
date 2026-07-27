"use client";

import { useCallback, useEffect, useState } from "react";

type UseAutoRotationOptions = {
  itemsCount: number;
  interval?: number;
  enabled?: boolean;
};

type UseAutoRotationReturn = {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  pause: () => void;
  resume: () => void;
};

export function useAutoRotation({
  itemsCount,
  interval = 2000,
  enabled = true,
}: UseAutoRotationOptions): UseAutoRotationReturn {
  const [activeIndex, setActiveIndexState] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!enabled || isPaused || itemsCount <= 1) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndexState((currentIndex) => {
        return (currentIndex + 1) % itemsCount;
      });
    }, interval);

    return () => {
      window.clearInterval(timer);
    };
  }, [enabled, interval, isPaused, itemsCount]);

  const setActiveIndex = useCallback(
    (index: number): void => {
      if (itemsCount <= 0) {
        return;
      }

      const normalizedIndex =
        ((index % itemsCount) + itemsCount) % itemsCount;

      setActiveIndexState(normalizedIndex);
    },
    [itemsCount],
  );

  const pause = useCallback((): void => {
    setIsPaused(true);
  }, []);

  const resume = useCallback((): void => {
    setIsPaused(false);
  }, []);

  return {
    activeIndex,
    setActiveIndex,
    pause,
    resume,
  };
}