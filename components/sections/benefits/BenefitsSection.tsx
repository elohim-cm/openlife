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
import {BENEFIT_DEFINITIONS,type Benefit,} from "./Benefits.data";

function BenefitFlowArrows() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1000 330"
      preserveAspectRatio="none"
      className="
        pointer-events-none
        absolute inset-0 z-20
        hidden size-full
        overflow-visible
        xl:block
      "
      fill="none"
    >
      <path
        d="M120 62C205 -10 326 -10 380 62"
        stroke="var(--benefits-flow-arrow-halo)"
        strokeWidth="9"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M120 62C205 -10 326 -10 380 62"
        stroke="var(--benefits-flow-arrow)"
        strokeWidth="4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M363 53L381 64L378 43"
        stroke="var(--benefits-flow-arrow)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      <path
        d="M625 268C610 345 454 345 380 268"
        stroke="var(--benefits-flow-arrow-halo)"
        strokeWidth="9"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M625 268C610 345 454 345 380 268"
        stroke="var(--benefits-flow-arrow)"
        strokeWidth="4"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d="M399 274L378 266L385 286"
        stroke="var(--benefits-flow-arrow)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

export function BenefitsSection() {
  const content = useSiteContent();
  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const emphasizedIntroductionParts =
    content.benefits.introduction.split(
      /(ACAM Vie|commencez à épargner|start saving)/g,
    );

  const benefits =
    useMemo<
      readonly Benefit[]
    >(() => {
      const translatedBenefits =
        BENEFIT_DEFINITIONS.map(
          (definition) => {
            const translatedItem =
              content.benefits
                .items.find(
                  (item) =>
                    item.id ===
                    definition.id,
                );

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

      return translatedBenefits;
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
          max-w-[1120px]
          px-5 pb-[60px]
          pt-[60px]
          sm:px-8
          lg:px-10
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
              text-cta
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
            "
          >
            {emphasizedIntroductionParts.map(
              (part, index) =>
                part === "ACAM Vie" ||
                part === "commencez à épargner" ||
                part === "start saving" ? (
                  <strong
                    key={`${part}-${index}`}
                    className="font-semibold"
                  >
                    {part}
                  </strong>
                ) : (
                  part
                ),
            )}
          </p>
        </motion.header>

        <div
          className="
            relative mt-[25px]
            xl:py-[58px]
          "
        >
          <div
            className="
              relative z-10
              grid grid-cols-2
              gap-3
              sm:gap-5
              xl:grid-cols-4
              xl:gap-7
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

          <BenefitFlowArrows />
        </div>
      </div>
    </section>
  );
}
