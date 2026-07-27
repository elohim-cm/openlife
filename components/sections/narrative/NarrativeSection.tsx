"use client";

import {
  motion,
  useInView,
  useReducedMotion,
} from "framer-motion";
import { useRef } from "react";

import { useTypeLoop } from "@/hooks/useTypeLoop";

import {
  NARRATIVE_CONFIG,
  NARRATIVE_PHRASES,
} from "./narrative.data";
import { NarrativeDeco } from "./NarrativeDeco";

export function NarrativeSection() {
  const sectionRef =
    useRef<HTMLElement>(null);

  const isInView = useInView(
    sectionRef,
    {
      amount: 0.25,
    },
  );

  const shouldReduceMotion =
    useReducedMotion();

  const reduceMotion = Boolean(
    shouldReduceMotion,
  );

  const {
    currentPhrase,
    characterIndex,
  } = useTypeLoop({
    phrases: NARRATIVE_PHRASES,
    enabled: isInView,
    typingSpeed:
      NARRATIVE_CONFIG.typingSpeed,
    holdDuration:
      NARRATIVE_CONFIG.holdDuration,
    reduceMotion,
  });

  return (
    <section
      ref={sectionRef}
      id="openlife-narrative"
      aria-labelledby="openlife-narrative-title"
      className="
        narrative-fixed-background
        relative isolate
        flex min-h-[310px]
        w-full items-center
        overflow-hidden
        sm:min-h-[340px]
        lg:min-h-[380px]
      "
    >
      <h2
        id="openlife-narrative-title"
        className="sr-only"
      >
        Open Life, votre épargne au quotidien
      </h2>

      <div
        aria-hidden="true"
        className="
          absolute inset-0 -z-20
          bg-[#0c5804]/80
          dark:bg-[#052a03]/88
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute inset-0 -z-10
          bg-[linear-gradient(90deg,rgba(4,55,1,0.84)_0%,rgba(19,105,5,0.65)_50%,rgba(2,45,1,0.86)_100%)]
        "
      />

      <NarrativeDeco reduceMotion={reduceMotion} />

      <div
        className="
          relative z-10
          mx-auto flex w-full
          max-w-[1500px]
          items-center justify-center
          px-5 py-20
          sm:px-8
          lg:px-10
        "
      >
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  scale: 0.97,
                  y: 24,
                }
          }
          animate={
            isInView
              ? {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                }
              : {
                  opacity: 0,
                  scale: 0.97,
                  y: 24,
                }
          }
          transition={{
            duration: reduceMotion
              ? 0
              : 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="
            w-full text-center
          "
        >
          <p
            aria-live="polite"
            className="sr-only"
          >
            {currentPhrase}
          </p>

          <p
            aria-hidden="true"
            className="
              mx-auto
              max-w-[1380px]
              text-balance
              text-[clamp(1.75rem,3.3vw,3.3rem)]
              font-bold
              leading-[1.22]
              tracking-[-0.035em]
              text-white
              drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]
            "
          >
            {currentPhrase
              .split("")
              .map(
                (character, index) => (
                  <span
                    key={`${currentPhrase}-${index}`}
                    className={
                      index <
                      characterIndex
                        ? "opacity-100"
                        : "opacity-0"
                    }
                  >
                    {character}
                  </span>
                ),
              )}

            <motion.span
              className="
                ml-[9px]
                inline-block
                size-[24px]
                rounded-full
                bg-[linear-gradient(145deg,#e92d16_0%,#ff6a29_100%)]
                align-[-2px]
                shadow-[0_4px_15px_rgba(229,46,21,0.55)]
                sm:size-[29px]
                lg:size-[35px]
              "
              animate={
                reduceMotion
                  ? undefined
                  : {
                      scale: [
                        1,
                        1.12,
                        1,
                      ],
                      opacity: [
                        1,
                        0.7,
                        1,
                      ],
                      boxShadow: [
                        "0 4px 15px rgba(229,46,21,0.45)",
                        "0 5px 24px rgba(255,106,41,0.75)",
                        "0 4px 15px rgba(229,46,21,0.45)",
                      ],
                    }
              }
              transition={{
                duration: 0.8,
                ease: "easeInOut",
                repeat: Infinity,
              }}
            />
          </p>
        </motion.div>
      </div>
    </section>
  );
}