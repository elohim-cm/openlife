"use client";

import Image from "next/image";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

import { useAutoRotation } from "@/hooks/useAutoRotation";

import {
  MOBILE_APP_SCREENS,
  type MobileAppScreen,
} from "./mobile-app.data";

type PhonePosition = {
  x: number;
  y: number;
  rotate: number;
  scale: number;
  zIndex: number;
  opacity: number;
};

const PHONE_POSITIONS: readonly PhonePosition[] = [
  {
    x: 0,
    y: 36,
    rotate: 0,
    scale: 1,
    zIndex: 30,
    opacity: 1,
  },
  {
    x: 134,
    y: -14,
    rotate: 7,
    scale: 0.86,
    zIndex: 20,
    opacity: 0.96,
  },
  {
    x: -118,
    y: -25,
    rotate: -7,
    scale: 0.86,
    zIndex: 10,
    opacity: 0.96,
  },
] as const;

function getRelativePosition(
  itemIndex: number,
  activeIndex: number,
  itemsCount: number,
): number {
  return (
    (itemIndex - activeIndex + itemsCount) %
    itemsCount
  );
}

type PhoneCardProps = {
  screen: MobileAppScreen;
  position: PhonePosition;
  reduceMotion: boolean;
};

function PhoneCard({
  screen,
  position,
  reduceMotion,
}: PhoneCardProps) {
  return (
    <motion.div
      initial={false}
      animate={{
        x: position.x,
        y: position.y,
        rotate: position.rotate,
        scale: position.scale,
        opacity: position.opacity,
      }}
      transition={
        reduceMotion
          ? {
              duration: 0,
            }
          : {
              type: "spring",
              stiffness: 115,
              damping: 20,
              mass: 0.9,
            }
      }
      style={{
        zIndex: position.zIndex,
      }}
      className="
        absolute left-1/2 top-1/2
        h-[420px] w-[225px]
        -translate-x-1/2 -translate-y-1/2
        will-change-transform
        sm:h-[475px] sm:w-[255px]
        xl:h-[525px] xl:w-[282px]
      "
    >
      <Image
        src={screen.src}
        alt={screen.alt}
        fill
        sizes="(max-width: 639px) 225px, (max-width: 1279px) 255px, 282px"
        className="drop-shadow-[0_28px_28px_rgba(33,70,42,0.22)]"
      />
    </motion.div>
  );
}

export function RotatingPhones() {
  const reduceMotion = useReducedMotion();

  const {
    activeIndex,
    pause,
    resume,
  } = useAutoRotation({
    itemsCount: MOBILE_APP_SCREENS.length,
    interval: 2000,
    enabled: !reduceMotion,
  });

  return (
    <div
      aria-label="Aperçus de l’application mobile Open Life"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      className="
        relative h-[520px] w-full
        overflow-hidden
        sm:h-[590px]
        lg:h-[640px]
      "
    >
      {MOBILE_APP_SCREENS.map((screen, index) => {
        const relativePosition = getRelativePosition(
          index,
          activeIndex,
          MOBILE_APP_SCREENS.length,
        );

        const position =
          PHONE_POSITIONS[relativePosition] ??
          PHONE_POSITIONS[0];

        return (
          <PhoneCard
            key={screen.id}
            screen={screen}
            position={position}
            reduceMotion={Boolean(reduceMotion)}
          />
        );
      })}
    </div>
  );
}