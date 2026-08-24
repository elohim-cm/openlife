"use client";

import { useInView, useReducedMotion } from "framer-motion";
import {
  LockKeyhole,
  ShieldCheck,
  Star,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import {
  useSiteContent,
} from "@/hooks/useSiteContent";

const TRUST_ICONS:
  Record<string, LucideIcon> = {
    approval: ShieldCheck,
    security: LockKeyhole,
    savers: UsersRound,
    rating: Star,
  };

const COUNT_DURATION = 1600;

function getAnimatedTitle(
  id: string,
  title: string,
  progress: number,
) {
  if (id === "savers") {
    const value = Math.round(50_000 * progress);
    const separator = title.includes(",") ? "," : " ";
    const formattedValue = String(value).replace(
      /\B(?=(\d{3})+(?!\d))/g,
      separator,
    );

    return title.replace(/50[\s,]000/, formattedValue);
  }

  if (id === "rating") {
    const decimalSeparator = title.includes("4,8") ? "," : ".";
    const value = (4.8 * progress)
      .toFixed(1)
      .replace(".", decimalSeparator);

    return title.replace(/4[.,]8/, value);
  }

  return title;
}

export function HeroTrustBar() {
  const content = useSiteContent();
  const reduceMotion = Boolean(useReducedMotion());
  const trustBarRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(trustBarRef, {
    once: true,
    amount: 0.45,
  });
  const [countProgress, setCountProgress] = useState(0);

  useEffect(() => {
    if (!isInView) {
      return;
    }

    if (reduceMotion) {
      setCountProgress(1);
      return;
    }

    let animationFrame = 0;
    const startTime = performance.now();

    const updateCount = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / COUNT_DURATION, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setCountProgress(easedProgress);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount);
      }
    };

    animationFrame = requestAnimationFrame(updateCount);

    return () => cancelAnimationFrame(animationFrame);
  }, [isInView, reduceMotion]);

  return (
    <div
      ref={trustBarRef}
      className="
        mx-auto grid w-full
        max-w-[1295px]
        grid-cols-2
        rounded-[16px]
        border
        border-[var(--hero-trust-border)]
        bg-[var(--hero-trust-background)]
        px-3 py-4
        shadow-[var(--hero-trust-shadow)]
        backdrop-blur-[10px]
        sm:px-5 sm:py-5
        lg:grid-cols-4
        lg:px-8
      "
    >
      {content.hero.trustItems.map(
        (item, index) => {
          const Icon =
            TRUST_ICONS[item.id];

          if (!Icon) {
            return null;
          }

          return (
            <div
              key={item.id}
              className={`
                flex min-h-[58px]
                items-center gap-2.5
                px-1.5 py-2
                sm:gap-4
                sm:px-5
                lg:justify-center
                ${
                  index % 2 === 1
                    ? "border-l border-[var(--hero-trust-divider)]"
                    : ""
                }
                ${
                  index > 0
                    ? "lg:border-l lg:border-[var(--hero-trust-divider)]"
                    : "lg:border-l-0"
                }
              `}
            >
              <Icon
                aria-hidden="true"
                className="
                  size-[31px]
                  shrink-0
                  text-brand
                "
                strokeWidth={1.9}
              />

              <p
                className="
                  text-[12px]
                  leading-[1.4]
                  text-text-muted
                  sm:text-[13px]
                "
              >
                <span
                  className="
                    block font-medium
                    text-heading-secondary
                  "
                >
                  {getAnimatedTitle(
                    item.id,
                    item.title,
                    countProgress,
                  )}
                </span>

                <span className="block">
                  {item.description}
                </span>
              </p>
            </div>
          );
        },
      )}
    </div>
  );
}
