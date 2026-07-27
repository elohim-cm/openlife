"use client";

import { motion } from "framer-motion";
import {FaArrowRight,FaBriefcase,} from "react-icons/fa";

import {BUSINESS_PARTNER,} from "./assistance.data";

type BusinessCardProps = {reduceMotion: boolean;};

export function BusinessCard({reduceMotion,}: BusinessCardProps) {
  return (
    <motion.aside aria-labelledby="business-partner-title"
      initial={reduceMotion? false: {opacity: 0,y: 28,}}
      whileInView={{opacity: 1,y: 0,}}
      viewport={{once: true,amount: 0.35,}}
      transition={{duration: reduceMotion? 0: 0.6,ease: [0.22, 1, 0.36, 1],}}
      className="
        relative overflow-hidden
        rounded-[18px]
        border border-border
        bg-[linear-gradient(135deg,var(--surface-muted)_0%,var(--surface-soft)_100%)]
        px-5 py-7
        shadow-card
        sm:px-8 sm:py-8
        lg:px-10
      "
    >
      <div aria-hidden="true"
        className="
          pointer-events-none
          absolute -right-20 -top-24
          size-[250px]
          rounded-full
          bg-brand-muted/35
          blur-[55px]
        "
      />

      <div className="
          relative z-10
          flex flex-col
          items-start gap-5
          sm:flex-row
          sm:items-start
          sm:gap-6
        "
      >
        <div className="
            flex size-[48px]
            shrink-0 items-center
            justify-center rounded-[13px]
            bg-accent-soft
            text-accent
          "
        >
          <FaBriefcase aria-hidden="true" className="size-[23px]"/>
        </div>

        <div className="min-w-0 flex-1">
          <h3 id="business-partner-title" className="
              text-[22px] font-bold
              leading-tight
              tracking-[-0.02em]
              text-heading-secondary
              sm:text-[24px]
            "
          >{BUSINESS_PARTNER.title}</h3>

          <p className="
              mt-[9px]
              max-w-[950px]
              text-[14px]
              leading-[1.65]
              text-text-muted
              sm:text-[15px]
            "
          >{BUSINESS_PARTNER.description}</p>

          <a href={BUSINESS_PARTNER.href} target="_blank" rel="noreferrer" className="
              group/button
              mt-[20px]
              inline-flex min-h-[46px]
              items-center justify-center
              gap-[9px]
              rounded-[8px]
              bg-brand
              px-[24px]
              text-[13px] font-bold
              text-brand-contrast
              shadow-[0_5px_12px_rgba(23,107,12,0.23)]
              transition-[background-color,transform,box-shadow]
              duration-200
              hover:-translate-y-0.5
              hover:bg-brand-hover
              hover:shadow-[0_8px_18px_rgba(23,107,12,0.30)]
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-focus
              focus-visible:ring-offset-2
              sm:text-[14px]
            "
          >
            <span>{BUSINESS_PARTNER.buttonLabel}</span>

            <FaArrowRight aria-hidden="true" className="
                size-[12px]
                transition-transform
                duration-200
                group-hover/button:translate-x-1
              "
            />
          </a>
        </div>
      </div>
    </motion.aside>
  );
}