"use client";

import {useEffect,useState,useMemo} from "react";

type useTypeLoopOptions = {
  phrases: readonly string[];
  enabled?: boolean;
  typingSpeed?: number;
  holdDuration?: number;
  reduceMotion?: boolean;
};

type useTypeLoopReturn = {
  displayedText: string;
  currentPhrase: string;
  phraseIndex: number;
  characterIndex: number;
  isComplete: boolean;
};

export function useTypeLoop({
  phrases,
  enabled = true,
  typingSpeed = 32,
  holdDuration = 2_200,
  reduceMotion = false,
}: useTypeLoopOptions): useTypeLoopReturn {
  const [phraseIndex, setPhraseIndex] =useState(0);
  const [characterIndex,setCharacterIndex,] = useState(0);
  const phrasesSignature = useMemo(() => phrases.join("\u0000"),[phrases],);

  useEffect(() => {
    setPhraseIndex(0);
    setCharacterIndex(0);
  }, [phrasesSignature]);

  const currentPhrase =phrases[phraseIndex] ?? "";

  const isComplete =characterIndex >= currentPhrase.length;

  useEffect(() => {
    if (phrases.length === 0 ||reduceMotion ||!enabled) {
      return;
    }

    const timer = window.setTimeout(
      () => {
        if (isComplete) {
          setPhraseIndex((currentIndex) => {
              return ((currentIndex + 1) %phrases.length);
            },
          );

          setCharacterIndex(0);
          return;
        }

        setCharacterIndex(
          (currentIndex) => Math.min(
              currentIndex + 1,
              currentPhrase.length,
            ),
        );
      },
      isComplete? holdDuration: typingSpeed,
    );

    return () => {
      window.clearTimeout(timer);
    };
  }, [
    characterIndex,
    currentPhrase,
    enabled,
    holdDuration,
    isComplete,
    phraseIndex,
    phrases,
    reduceMotion,
    typingSpeed,
  ]);

  if (reduceMotion) {
    return {
      displayedText: currentPhrase,
      currentPhrase,
      phraseIndex,
      characterIndex:
        currentPhrase.length,
      isComplete: true,
    };
  }

  return {
    displayedText:
      currentPhrase.slice(
        0,
        characterIndex,
      ),
    currentPhrase,
    phraseIndex,
    characterIndex,
    isComplete,
  };
}