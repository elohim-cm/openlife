"use client";

import {type RefObject,useCallback,useEffect,useRef,useState,} from "react";

import type { ScrollStoryState } from "@/types/scroll-story";

type UseScrollStoryOptions = { stepsCount: number;};

type UseScrollStoryReturn = ScrollStoryState & {
  sectionRef: RefObject<HTMLElement | null>;
  scrollToStep: (index: number) => void;
};

const clamp = ( 
  value: number,
  minimum: number,
  maximum: number,
): number => {return Math.min(Math.max(value, minimum), maximum);};

export function useScrollStory({
  stepsCount,
}: UseScrollStoryOptions): UseScrollStoryReturn {
  const sectionRef = useRef<HTMLElement>(null);
  const previousIndexRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);

  const [state, setState] = useState<ScrollStoryState>({
    activeIndex: 0,
    direction: 1,
    progress: 0,
  });

  useEffect(() => {
    const section = sectionRef.current;

    if (!section || stepsCount <= 0) {
      return;
    }

    const updateScrollState = (): void => {
      const sectionRect = section.getBoundingClientRect();
      const sectionHeight = section.offsetHeight;
      const viewportHeight = window.innerHeight;

      /* Distance totale pendant laquelle le contenu sticky peut rester fixé dans la fenêtre.*/
      const scrollableDistance = Math.max(
        sectionHeight - viewportHeight,
        1,
      );

      /* Lorsque le haut de la section remonte au-dessus du viewport, sectionRect.top devient négatif.*/
      const distanceScrolledInsideSection = -sectionRect.top;
      const progress = clamp(distanceScrolledInsideSection / scrollableDistance,0,1,);
      const rawIndex = Math.floor(progress * stepsCount);
      const activeIndex = clamp(rawIndex,0,stepsCount - 1,);
      const previousIndex = previousIndexRef.current;
      const direction: 1 | -1 = activeIndex >= previousIndex ? 1 : -1;
      previousIndexRef.current = activeIndex;
      setState((previousState) => {
        if (
          previousState.activeIndex === activeIndex &&
          previousState.direction === direction &&
          Math.abs(previousState.progress - progress) < 0.001
        ) {
          return previousState;
        }

        return { activeIndex,direction,progress,};
      });
    };

    const handleScroll = (): void => {
      if (animationFrameRef.current !== null) {
        return;
      }

      animationFrameRef.current = window.requestAnimationFrame(() => {
        updateScrollState();
        animationFrameRef.current = null;
      });
    };

    updateScrollState();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);

      if (animationFrameRef.current !== null) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [stepsCount]);

  const scrollToStep = useCallback(
    (index: number): void => {
      const section = sectionRef.current;

      if (!section || stepsCount <= 0) {
        return;
      }

      const targetIndex = clamp(
        index,
        0,
        stepsCount - 1,
      );
      const sectionTop =
        window.scrollY +
        section.getBoundingClientRect().top;
      const scrollableDistance = Math.max(
        section.offsetHeight -
          window.innerHeight,
        1,
      );
      const targetProgress =
        (targetIndex + 0.5) /
        stepsCount;
      const direction: 1 | -1 =
        targetIndex >=
        previousIndexRef.current
          ? 1
          : -1;

      previousIndexRef.current =
        targetIndex;
      setState({
        activeIndex: targetIndex,
        direction,
        progress: targetProgress,
      });

      window.scrollTo({
        top:
          sectionTop +
          scrollableDistance *
            targetProgress,
        behavior: "auto",
      });
    },
    [stepsCount],
  );

  return { sectionRef,
    activeIndex: state.activeIndex,
    direction: state.direction,
    progress: state.progress,
    scrollToStep,
  };
}
