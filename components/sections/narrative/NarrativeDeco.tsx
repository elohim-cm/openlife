"use client";

import { motion } from "framer-motion";

type NarrativeDecoProps = {
  reduceMotion: boolean;
};

const PARTICLES = [
  {
    id: "particle-1",
    className:
      "left-[8%] top-[24%] size-[5px]",
    duration: 5.5,
    delay: 0,
  },
  {
    id: "particle-2",
    className:
      "left-[20%] bottom-[20%] size-[7px]",
    duration: 6.5,
    delay: 0.8,
  },
  {
    id: "particle-3",
    className:
      "right-[12%] top-[25%] size-[6px]",
    duration: 5,
    delay: 0.4,
  },
  {
    id: "particle-4",
    className:
      "right-[25%] bottom-[17%] size-[4px]",
    duration: 7,
    delay: 1.1,
  },
] as const;

export function NarrativeDeco({
  reduceMotion,
}: NarrativeDecoProps) {
  return (
    <div
      aria-hidden="true"
      className="
        pointer-events-none
        absolute inset-0
        overflow-hidden
      "
    >
      <motion.div
        className="
          absolute
          -left-[100px] top-1/2
          size-[270px]
          -translate-y-1/2
          rounded-full
          bg-[#7ddd55]/15
          blur-[75px]
        "
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, 55, 0],
                scale: [1, 1.12, 1],
                opacity: [0.3, 0.55, 0.3],
              }
        }
        transition={{
          duration: 9,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      <motion.div
        className="
          absolute
          -right-[120px] top-[-80px]
          size-[330px]
          rounded-full
          bg-[#ff5a2e]/10
          blur-[95px]
        "
        animate={
          reduceMotion
            ? undefined
            : {
                x: [0, -45, 0],
                y: [0, 35, 0],
                scale: [1, 1.18, 1],
              }
        }
        transition={{
          duration: 11,
          ease: "easeInOut",
          repeat: Infinity,
        }}
      />

      {PARTICLES.map((particle) => (
        <motion.span
          key={particle.id}
          className={`
            absolute rounded-full
            bg-white/45
            shadow-[0_0_12px_rgba(255,255,255,0.35)]
            ${particle.className}
          `}
          animate={
            reduceMotion
              ? undefined
              : {
                  y: [0, -13, 0],
                  opacity: [
                    0.25,
                    0.75,
                    0.25,
                  ],
                  scale: [1, 1.25, 1],
                }
          }
          transition={{
            duration:
              particle.duration,
            delay:
              particle.delay,
            ease: "easeInOut",
            repeat: Infinity,
          }}
        />
      ))}

      <motion.div
        className="
          absolute left-1/2 top-0
          h-px w-[70%]
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-white/35
          to-transparent
        "
        initial={
          reduceMotion
            ? false
            : {
                scaleX: 0,
                opacity: 0,
              }
        }
        whileInView={{
          scaleX: 1,
          opacity: 1,
        }}
        viewport={{
          once: true,
          amount: 0.5,
        }}
        transition={{
          duration: reduceMotion
            ? 0
            : 1.2,
          ease: [0.22, 1, 0.36, 1],
        }}
      />

      <motion.div
        className="
          absolute bottom-0
          left-1/2
          h-px w-[70%]
          -translate-x-1/2
          bg-gradient-to-r
          from-transparent
          via-white/25
          to-transparent
        "
        initial={
          reduceMotion
            ? false
            : {
                scaleX: 0,
                opacity: 0,
              }
        }
        whileInView={{
          scaleX: 1,
          opacity: 1,
        }}
        viewport={{
          once: true,
          amount: 0.5,
        }}
        transition={{
          duration: reduceMotion
            ? 0
            : 1.2,
          delay: reduceMotion
            ? 0
            : 0.15,
          ease: [0.22, 1, 0.36, 1],
        }}
      />
    </div>
  );
}