"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import type {
  Benefit,
} from "./Benefits.data";

type BenefitCardProps = {
  benefit: Benefit;
  index: number;
  reduceMotion: boolean;
};

export function BenefitCard({
  benefit,
  index,
  reduceMotion,
}: BenefitCardProps) {
  const Icon = benefit.icon;
  const isNoFees =
    benefit.id === "no-fees";
  const isDailyContribution =
    benefit.id ===
    "daily-contribution";

  return (
    <motion.article
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 34,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.28,
      }}
      transition={{
        duration:
          reduceMotion ? 0 : 0.68,
        delay:
          reduceMotion
            ? 0
            : index * 0.08,
        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      }}
      className="h-full"
    >
      <Card
        className="
          group h-full
          min-h-[150px]
          rounded-[14px]
          border
          border-[var(--benefits-card-border)]
          bg-[var(--benefits-card)]
          py-0
          shadow-[var(--benefits-card-shadow)]
          transition-[transform,border-color,box-shadow]
          duration-500
          ease-[cubic-bezier(0.16,1,0.3,1)]
          hover:-translate-y-1.5
          hover:border-brand/30
          hover:shadow-[var(--benefits-card-shadow-hover)]
          sm:rounded-[18px]
        "
      >
        <CardContent
          className="
            flex h-full
            flex-col items-center
            px-2.5 pb-3.5 pt-3.5
            text-center
            sm:px-6
            sm:pb-7
            sm:pt-7
          "
        >
          <div
            className="
              relative flex
              size-[56px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[var(--benefits-icon-background)]
              text-brand
              transition-transform
              duration-500
              ease-[cubic-bezier(0.16,1,0.3,1)]
              group-hover:scale-[1.035]
              sm:size-[96px]
            "
          >
            <Icon
              aria-hidden="true"
              className="size-[26px] sm:size-[46px]"
              strokeWidth={1.7}
            />

            {isDailyContribution && (
              <span
                aria-hidden="true"
                className="
                  absolute
                  bottom-[6px]
                  right-[4px]
                  flex size-[18px]
                  items-center
                  justify-center
                  rounded-full
                  border-[2px]
                  border-[var(--benefits-icon-background-solid)]
                  bg-[var(--benefits-icon-background-solid)]
                  text-[5px]
                  font-extrabold
                  tracking-[-0.04em]
                  text-cta
                  sm:bottom-[15px]
                  sm:right-[10px]
                  sm:size-[31px]
                  sm:border-[3px]
                  sm:text-[8px]
                "
              >
                FCFA
              </span>
            )}

            {isNoFees && (
              <span
                aria-hidden="true"
                className="
                  absolute
                  bottom-[5px]
                  right-[3px]
                  flex size-[18px]
                  items-center
                  justify-center
                  rounded-full
                  border-[2px]
                  border-[var(--benefits-icon-background-solid)]
                  bg-[var(--benefits-icon-background-solid)]
                  text-cta
                  sm:bottom-[11px]
                  sm:right-[8px]
                  sm:size-[31px]
                  sm:border-[3px]
                "
              >
                <Check
                  className="
                    size-[11px]
                    sm:size-[18px]
                  "
                  strokeWidth={2.6}
                />
              </span>
            )}
          </div>

          <div
            className="
              mt-2 flex flex-1
              flex-col items-center
              justify-center
              sm:mt-3
            "
          >
            {benefit.label && (
              <p
                className="
                  text-[12px]
                  font-semibold
                  leading-[1.15]
                  tracking-[-0.025em]
                  text-heading-secondary
                  sm:mt-1
                  sm:text-[20px]
                  sm:leading-[1.25]
                "
              >
                {benefit.label}
              </p>
            )}

            <p
              className={`
                font-extrabold
                leading-[0.98]
                tracking-[-0.055em]
                text-cta
                ${
                  isNoFees
                    ? `
                      mt-1.5
                      text-[18px]
                      sm:mt-3
                      sm:text-[33px]
                    `
                    : `
                      mt-1
                      text-[32px]
                      sm:mt-2
                      sm:text-[62px]
                    `
                }
              `}
            >
              {benefit.value}
            </p>

            <div
              className={
                isNoFees
                  ? "mt-1.5 sm:mt-4"
                  : "mt-1 sm:mt-2"
              }
            >
              {benefit.description.map(
                (line) => (
                  <p
                    key={line}
                    className={`
                      tracking-[-0.025em]
                      text-text
                      ${
                        isNoFees
                          ? `
                            text-[11.5px]
                            font-normal
                            leading-[1.3]
                            sm:text-[17px]
                            sm:leading-[1.55]
                          `
                          : `
                            text-[11.5px]
                            font-semibold
                            leading-[1.2]
                            sm:text-[18px]
                            sm:leading-[1.35]
                          `
                      }
                    `}
                  >
                    {line}
                  </p>
                ),
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}