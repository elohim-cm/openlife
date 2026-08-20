"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";

import { useAutoRotation } from "@/hooks/useAutoRotation";
import { useSiteContent } from "@/hooks/useSiteContent";
import { useTheme } from "@/hooks/useTheme";

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

const PHONE_POSITIONS:
  readonly PhonePosition[] = [
    {
      x: 0,
      y: 0,
      rotate: 0,
      scale: 1,
      zIndex: 30,
      opacity: 1,
    },
    {
      x: 194,
      y: 30,
      rotate: 4.5,
      scale: 0.82,
      zIndex: 20,
      opacity: 0.94,
    },
    {
      x: -194,
      y: 30,
      rotate: -4.5,
      scale: 0.82,
      zIndex: 20,
      opacity: 0.94,
    },
  ] as const;

function getRelativePosition(
  itemIndex: number,
  activeIndex: number,
  itemsCount: number,
): number {
  return (
    (
      itemIndex -
      activeIndex +
      itemsCount
    ) % itemsCount
  );
}

type PhoneCardProps = {
  screen: MobileAppScreen;
  position: PhonePosition;
  reduceMotion: boolean;
  isDark: boolean;
};

function PhoneCard({
  screen,
  position,
  reduceMotion,
  isDark,
}: PhoneCardProps) {
  const imageSrc = isDark
    ? screen.darkSrc
    : screen.lightSrc;

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
          ? { duration: 0 }
          : {
              type: "spring",
              stiffness: 105,
              damping: 20,
              mass: 0.9,
            }
      }
      style={{
        zIndex: position.zIndex,
      }}
      className="
        absolute
        left-1/2 top-1/2
        h-[410px] w-[218px]
        -translate-x-1/2
        -translate-y-1/2
        rounded-[30px]
        border border-cta-contrast/18
        bg-[var(--mobile-phone-frame)]
        shadow-phone
        will-change-transform
        sm:h-[470px]
        sm:w-[250px]
        sm:rounded-[34px]
        xl:h-[530px]
        xl:rounded-[38px]
      "
    >
      <motion.div
        key={imageSrc}
        initial={
          reduceMotion
            ? false
            : { opacity: 0.35 }
        }
        animate={{ opacity: 1 }}
        transition={{
          duration:
            reduceMotion ? 0 : 0.45,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="
          relative h-full w-full
          overflow-hidden
          rounded-[24px]
          sm:rounded-[27px]
          xl:rounded-[30px]
        "
      >
        <Image
          src={imageSrc}
          alt={screen.alt}
          fill
          sizes="
            (max-width: 639px) 218px,
            (max-width: 1279px) 250px,
            282px
          "
          className="
            rounded-[24px]
            object-cover
            sm:rounded-[27px]
            xl:rounded-[30px]
          "
        />
      </motion.div>
    </motion.div>
  );
}

export function RotatingPhones() {
  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const content = useSiteContent();
  const { isDark } = useTheme();

  const screens:
    readonly MobileAppScreen[] =
      MOBILE_APP_SCREENS.map(
        (screen, index) => ({
          ...screen,
          alt:
            content.mobileApp
              .screens[index]
              ?.alt ?? "",
        }),
      );

  const {
    activeIndex,
    setActiveIndex,
    pause,
    resume,
  } = useAutoRotation({
    itemsCount: screens.length,
    interval: 2000,
    enabled: !reduceMotion,
  });

  return (
    <div
      role="region"
      aria-label={
        content.mobileApp
          .carouselLabel
      }
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocusCapture={pause}
      onBlurCapture={resume}
      className="
        relative h-[540px]
        w-full overflow-hidden
        sm:h-[610px]
        lg:h-[690px]
      "
    >
      {screens.map(
        (screen, index) => {
          const relativePosition =
            getRelativePosition(
              index,
              activeIndex,
              screens.length,
            );

          const position =
            PHONE_POSITIONS[
              relativePosition
            ] ?? PHONE_POSITIONS[0];

          return (
            <PhoneCard
              key={screen.id}
              screen={screen}
              position={position}
              reduceMotion={
                reduceMotion
              }
              isDark={isDark}
            />
          );
        },
      )}

      <div
        className="
          absolute bottom-5
          left-1/2 z-40
          flex -translate-x-1/2
          items-center gap-3
          sm:bottom-7
        "
      >
        {screens.map(
          (screen, index) => {
            const isActive =
              index === activeIndex;

            return (
              <button
                key={screen.id}
                type="button"
                aria-label={
                  content.mobileApp
                    .screens[index]
                    ?.alt ?? ""
                }
                aria-current={
                  isActive
                    ? "true"
                    : undefined
                }
                onClick={() => {
                  setActiveIndex(index);
                }}
                className={`
                  rounded-full
                  border border-cta-contrast/40
                  transition-[width,height,background-color,opacity]
                  focus-visible:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-cta-contrast
                  focus-visible:ring-offset-3
                  focus-visible:ring-offset-brand-strong
                  ${
                    isActive
                      ? `
                        size-[13px]
                        bg-cta-contrast
                        opacity-100
                      `
                      : `
                        size-[10px]
                        bg-cta-contrast/45
                        opacity-80
                        hover:bg-cta-contrast/75
                      `
                  }
                `}
              />
            );
          },
        )}
      </div>
    </div>
  );
}