"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import {
  ChartNoAxesCombined,
  ShieldCheck,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";

import {
  useSiteContent,
} from "@/hooks/useSiteContent";
import {
  useTheme,
} from "@/hooks/useTheme";

const FLOATING_CARD_ICONS:
  Record<string, LucideIcon> = {
    regularity:
      ChartNoAxesCombined,
    security: ShieldCheck,
    accessibility: UsersRound,
  };

const FLOATING_CARD_POSITIONS = {
  regularity:
    "left-0 top-[38%] sm:left-[1%] sm:top-[39%] xl:-left-[2%]",

  security:
    "right-0 top-[12%] sm:right-[1%] sm:top-[14%] xl:-right-[2%]",

  accessibility:
    "bottom-[13%] right-0 sm:bottom-[18%] sm:right-[3%] xl:-right-[1%]",
} as const;

export function HeroPhoneVisual() {
  const content = useSiteContent();
  const { isDark } = useTheme();
  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const mockupSrc = isDark
    ? "/images/mobile-app/mockup-hero-dark.png"
    : "/images/mobile-app/mockup-hero-light.png";

  return (
    <div
      className="
        relative mx-auto
        h-[560px] w-full
        max-w-[390px]
        sm:h-[610px]
        sm:max-w-[680px]
        lg:h-[690px]
      "
    >
      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 36,
                scale: 0.96,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
          scale: 1,
        }}
        transition={{
          duration:
            reduceMotion ? 0 : 0.9,
          delay:
            reduceMotion ? 0 : 0.15,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
        className="
          absolute
          left-1/2 top-1/2
          z-20
          h-[540px] w-[497px]
          -translate-x-1/2
          -translate-y-1/2
          sm:h-[680px]
          sm:w-[625px]
          lg:h-[760px]
          lg:w-[700px]
        "
      >
        <motion.div
          key={mockupSrc}
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0.2,
                }
          }
          animate={{
            opacity: 1,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 0.45,
          }}
          className="
            relative
            h-full w-full
          "
        >
          <Image
            src={mockupSrc}
            alt={
              content.hero
                .phoneImageAlt
            }
            fill
            priority
            sizes="
              (max-width: 639px) 497px,
              (max-width: 1023px) 625px,
              700px
            "
            className="
              object-contain
              drop-shadow-[0_30px_45px_rgba(4,35,10,0.34)]
              dark:drop-shadow-[0_34px_52px_rgba(0,0,0,0.52)]
            "
          />
        </motion.div>
      </motion.div>

      {content.hero.floatingCards.map(
        (card, index) => {
          const Icon =
            FLOATING_CARD_ICONS[
              card.id
            ];

          if (!Icon) {
            return null;
          }

          const position =
            FLOATING_CARD_POSITIONS[
              card.id as keyof typeof FLOATING_CARD_POSITIONS
            ] ?? "";

          return (
            <motion.article
              key={card.id}
              initial={
                reduceMotion
                  ? false
                  : {
                      opacity: 0,
                      scale: 0.9,
                    }
              }
              animate={
                reduceMotion
                  ? {
                      opacity: 1,
                      y: 0,
                    }
                  : {
                      opacity: 1,
                      y: [
                        0,
                        index % 2 === 0
                          ? -12
                          : 11,
                        0,
                      ],
                    }
              }
              transition={
                reduceMotion
                  ? { duration: 0 }
                  : {
                      opacity: {
                        duration: 0.55,
                        delay:
                          0.45 +
                          index * 0.12,
                      },
                      scale: {
                        duration: 0.55,
                        delay:
                          0.45 +
                          index * 0.12,
                      },
                      y: {
                        duration:
                          3.6 +
                          index * 0.45,
                        repeat: Infinity,
                        ease: "easeInOut",
                        delay:
                          index * 0.35,
                      },
                    }
              }
              className={`
                absolute z-30
                block w-[108px]
                rounded-[13px]
                border
                border-[var(--hero-floating-border)]
                bg-[var(--hero-floating-card)]
                px-3 py-3.5
                text-left
                shadow-[var(--hero-floating-shadow)]
                backdrop-blur-[8px]
                sm:w-[138px]
                sm:rounded-[15px]
                sm:px-[17px]
                sm:py-[18px]
                ${position}
              `}
            >
              <span
                className="
                  sm:size-[37px]
                  items-center
                  justify-center
                  rounded-[9px]
                  bg-brand-soft
                  text-brand
                "
              >
                <Icon
                  aria-hidden="true"
                  className="size-[18px] sm:size-[21px]"
                  strokeWidth={2}
                />
              </span>

              <h3
                className="
                  mt-3 text-[14px]
                  font-semibold
                  leading-tight
                  text-heading-secondary
                "
              >
                {card.title}
              </h3>

              {card.value && (
                <p
                  className="
                    mt-1 text-[24px]
                    font-bold
                    leading-none
                    text-heading-secondary
                  "
                >
                  {card.value}
                </p>
              )}

              <p
                className="
                  mt-2 text-[11px]
                  leading-[1.45]
                  text-text-muted
                "
              >
                {card.description}
              </p>
            </motion.article>
          );
        },
      )}
    </div>
  );
}
