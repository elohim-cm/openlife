"use client";

import { motion } from "framer-motion";
import {
  FaArrowRight,
  FaPercent,
} from "react-icons/fa";

import type {
  BusinessPartner,
} from "./assistance.data";

type BusinessCardProps = {
  partner: BusinessPartner;
  reduceMotion: boolean;
};

export function BusinessCard({
  partner,
  reduceMotion,
}: BusinessCardProps) {
  return (
    <motion.aside
      aria-labelledby="business-partner-title"
      initial={
        reduceMotion
          ? false
          : {
              opacity: 0,
              y: 28,
            }
      }
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        amount: 0.3,
      }}
      transition={{
        duration:
          reduceMotion ? 0 : 0.7,
        ease: [
          0.16,
          1,
          0.3,
          1,
        ],
      }}
      className="
        openlife-business-card-background
        relative isolate
        overflow-hidden
        rounded-[22px]
        border border-(--business-card-border)
        px-6 py-8
        text-(--business-card-text)
        shadow-[0_20px_55px_rgba(5,75,25,0.22)]
        sm:px-8
        sm:py-9
        lg:px-12
        lg:py-10
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_0%_0%,rgba(78,190,65,0.24),transparent_35%),radial-gradient(circle_at_100%_100%,rgba(13,68,24,0.45),transparent_42%)]
        "
      />

      <div
        className="
          relative z-10
          grid items-center
          gap-4
          lg:grid-cols-[1.45fr_0.9fr]
        "
      >
        <div
          className="
            min-w-0
            lg:border-r
            lg:border-(--business-card-divider)
            lg:pr-10
          "
        >
          <h3
            id="business-partner-title"
            className="
              text-[27px]
              font-bold
              leading-[1.18]
              tracking-[-0.025em]
              text-white
              sm:text-[31px]
              lg:text-[34px]
            "
          >
            {partner.title}
          </h3>

          <p
            className="
              mt-4
              max-w-[620px]
              text-[15px]
              leading-[1.65]
              text-(--business-card-text-muted)
              sm:text-[17px]
            "
          >
            {partner.description}
          </p>
        </div>

        <div className="flex lg:justify-end">
          <a
            href={partner.href}
            aria-label={
              partner.buttonAriaLabel
            }
            target="_blank"
            rel="noreferrer"
            className="
              group/button
              inline-flex
              min-h-[60px]
              w-full
              items-center
              justify-center
              gap-4
              rounded-[14px]
              bg-white
              px-7
              text-[15px]
              font-bold
              text-[#163719]
              shadow-[0_12px_30px_rgba(0,0,0,0.16)]
              transition-[background-color,color,transform,box-shadow]
              hover:-translate-y-1
              hover:bg-[#f4fff1]
              hover:text-brand
              hover:shadow-[0_18px_38px_rgba(0,0,0,0.20)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-white
              focus-visible:ring-offset-4
              focus-visible:ring-offset-[#08751e]
              sm:w-auto
              sm:min-w-[245px]
              sm:text-[16px]
            "
          >
            <span>
              {partner.buttonLabel}
            </span>

            <FaArrowRight
              aria-hidden="true"
              className="
                size-[14px]
                text-[#e63824]
                transition-transform
                group-hover/button:translate-x-1.5
              "
            />
          </a>
        </div>
      </div>
    </motion.aside>
  );
}