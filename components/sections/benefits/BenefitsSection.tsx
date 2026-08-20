"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { useMemo } from "react";

import {
  useSiteContent,
} from "@/hooks/useSiteContent";

import { BenefitCard } from "./BenefitCard";
import {
  BENEFIT_DEFINITIONS,
  type Benefit,
} from "./Benefits.data";

export function BenefitsSection() {
  const content = useSiteContent();
  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const benefits =
    useMemo<
      readonly Benefit[]
    >(() => {
      return BENEFIT_DEFINITIONS.map(
        (definition, index) => {
          const translatedItem =
            content.benefits
              .items[index];

          return {
            id: definition.id,
            icon: definition.icon,
            label:
              translatedItem
                ?.label ?? "",
            value:
              translatedItem
                ?.value ?? "",
            description:
              translatedItem
                ?.description ?? [],
          };
        },
      );
    }, [content.benefits.items]);

  return (
    <section
      id="openlife-benefits"
      data-section-after-hero
      aria-labelledby="openlife-benefits-title"
      className="
        benefits-theme-background
        relative isolate
        overflow-hidden
      "
    >
      <div
        className="
          relative z-10
          mx-auto w-full
          max-w-[1300px]
          px-5 pb-[60px]
          pt-[60px]
          sm:px-8
          lg:px-10
          lg:pb-[132px]
          lg:pt-[126px]
        "
      >
        <motion.header
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  y: 24,
                }
          }
          whileInView={{
            opacity: 1,
            y: 0,
          }}
          viewport={{
            once: true,
            amount: 0.55,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 0.72,
            ease: [
              0.16,
              1,
              0.3,
              1,
            ],
          }}
          className="text-center"
        >
          <div
            className="
              mx-auto inline-flex
              min-h-[42px]
              items-center
              justify-center
              gap-3
              rounded-full
              border
              border-[var(--benefits-badge-border)]
              px-5
              text-[12px]
              font-semibold
              uppercase
              tracking-[0.14em]
              text-brand
              sm:text-[13px]
            "
          >
            <ShieldCheck
              aria-hidden="true"
              className="size-[19px]"
              strokeWidth={2.1}
            />

            <span>
              {content.benefits.badge}
            </span>
          </div>

          <h2
            id="openlife-benefits-title"
            className="
              mt-6
              text-[42px]
              font-extrabold
              leading-[1.06]
              tracking-[-0.045em]
              text-heading
              sm:text-[55px]
              lg:text-[68px]
            "
          >
            {content.benefits.title}
          </h2>

          <p
            className="
              mx-auto mt-6
              max-w-[620px]
              text-[16px]
              font-normal
              leading-[1.65]
              text-text
              sm:text-[18px]
              lg:text-[19px]
            "
          >
            {
              content.benefits
                .introduction
            }
          </p>
        </motion.header>

        <div
          className="
            mt-[52px]
            grid grid-cols-2
            gap-3
            sm:gap-5
            xl:grid-cols-4
            xl:gap-[18px]
          "
        >
          {benefits.map(
            (benefit, index) => (
              <BenefitCard
                key={benefit.id}
                benefit={benefit}
                index={index}
                reduceMotion={
                  reduceMotion
                }
              />
            ),
          )}
        </div>
      </div>
    </section>
  );
}