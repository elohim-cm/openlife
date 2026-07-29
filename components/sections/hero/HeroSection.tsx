"use client";

import Image from "next/image";
import Link from "next/link";
import type {
  IconType,
} from "react-icons";
import {
  FaChartLine,
  FaChevronDown,
  FaClock,
  FaShieldAlt,
  FaUser,
  FaWallet,
} from "react-icons/fa";

import {
  useSiteContent,
} from "@/hooks/useSiteContent";

import {
  HeroFeatureCard,
} from "./HeroFeatureCard";

const HERO_FEATURE_ICONS:
  Record<string, IconType> = {
    "minimum-deposit":
      FaWallet,
    "interest-rate":
      FaChartLine,
    withdrawal:
      FaClock,
  };

const HERO_LINKS = {
  simulation:
    "#openlife-experience",
  learnMore:
    "#openlife-benefits",
} as const;

export function HeroSection() {
  const content =
    useSiteContent();

  const handleScrollDown =
    (): void => {
      const nextSection =
        document.querySelector<HTMLElement>(
          "[data-section-after-hero]",
        );

      if (nextSection) {
        nextSection.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });

        return;
      }

      window.scrollTo({
        top:
          window.innerHeight,
        behavior: "smooth",
      });
    };

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="
        relative isolate flex
        min-h-195 w-full
        overflow-hidden
        bg-background
        lg:h-svh
        lg:min-h-205
      "
    >
      <Image
        src="/images/hero/openlife-hero.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="
          -z-30 object-cover
          object-[63%_center]
          motion-safe:animate-[hero-image-reveal_1.3s_ease-[cubic-bezier(0.22,1,0.36,1)]_both]
          md:object-center
        "
      />

      <div
        aria-hidden="true"
        className="
          absolute inset-0
          -z-20 bg-overlay
        "
      />

      <div
        aria-hidden="true"
        className="
          hero-theme-overlay
          absolute inset-0 -z-10
        "
      />

      <div
        aria-hidden="true"
        className="
          hero-theme-radial
          absolute inset-0 -z-10
        "
      />

      <div
        className="
          mx-auto flex w-full
          max-w-[1428px]
          items-center
          px-5 pb-20 pt-[130px]
          sm:px-8
          lg:pb-16
          lg:pt-[110px]
        "
      >
        <div className="relative z-10 w-full max-w-[800px]">
          <div
            className="
              hero-reveal
              hero-reveal-delay-1
              mb-[18px]
              inline-flex min-h-[41px]
              items-center gap-[8px]
              rounded-full
              border border-border-brand
              bg-brand-soft/90
              px-[17px] py-[8px]
              text-brand
              backdrop-blur-[3px]
            "
          >
            <FaShieldAlt
              aria-hidden="true"
              className="
                size-[14px]
                shrink-0
              "
            />

            <span
              className="
                text-[13px]
                font-medium uppercase
                tracking-[0.07em]
                sm:text-[15px]
              "
            >
              {
                content.hero
                  .accreditation
              }
            </span>
          </div>

          <div
            className="
              hero-reveal
              hero-reveal-delay-2
            "
          >
            <p
              className="
                mb-[6px]
                text-[21px]
                font-normal
                leading-[1.3]
                text-heading-secondary
                sm:text-[23px]
              "
            >
              {
                content.hero
                  .welcome
              }
            </p>

            <h1
              id="hero-title"
              className="
                text-[50px] font-bold
                leading-[1.06]
                tracking-[-0.035em]
                text-heading
                sm:text-[60px]
                lg:text-[66px]
              "
            >
              {
                content.hero
                  .title
              }
            </h1>
          </div>

          <p
            className="
              hero-reveal
              hero-reveal-delay-3
              mt-[27px]
              max-w-[570px]
              text-[17px]
              font-normal
              leading-[1.56]
              text-text
              sm:text-[19px]
            "
          >
            {
              content.hero
                .descriptionStart
            }{" "}

            <strong
              className="
                rounded-[3px]
                bg-brand-soft
                px-[7px] py-[2px]
                font-bold
                text-brand
              "
            >
              {
                content.hero
                  .dailyAmount
              }
            </strong>{" "}

            {
              content.hero
                .descriptionEnd
            }
          </p>

          <div
            className="
              hero-reveal
              hero-reveal-delay-4
              mt-7.75
              flex flex-wrap
              gap-3.5
              sm:gap-5.5
            "
          >
            {content.hero.features.map(
              (feature) => {
                const Icon =HERO_FEATURE_ICONS[feature.id];
                if (!Icon) {return null;}

                return (
                  <HeroFeatureCard key={feature.id} icon={Icon} label={feature.label}/>
                );
              },
            )}
          </div>

          <div
            className="
              hero-reveal
              hero-reveal-delay-5
              mt-9.5
              flex flex-wrap
              items-center
              gap-3.75
            "
          >
            <Link
              href={HERO_LINKS.simulation}
              aria-label={content.hero.actions.simulationLabel}
              className="
                group inline-flex
                min-h-14.5
                items-center
                justify-center
                gap-2.5
                rounded-full
                bg-cta
                px-7.5
                text-[15px]
                font-bold
                text-cta-contrast
                shadow-button
                transition-[background-color,transform,box-shadow]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:-translate-y-1
                hover:bg-cta-hover
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-focus
                focus-visible:ring-offset-3
                active:translate-y-0
              "
            >
              <FaUser
                aria-hidden="true"
                className="
                  size-3.5
                  transition-transform
                  duration-500
                  ease-[cubic-bezier(0.22,1,0.36,1)]
                  group-hover:scale-110
                "
              />

              <span>
                {
                  content.hero.actions
                    .simulation
                }
              </span>
            </Link>

            <Link
              href={
                HERO_LINKS.learnMore
              }
              aria-label={
                content.hero.actions
                  .learnMoreLabel
              }
              className="
                inline-flex
                min-h-[58px]
                items-center
                justify-center
                rounded-full
                border-2
                border-brand
                bg-surface/55
                px-[32px]
                text-[15px]
                font-bold
                text-brand
                backdrop-blur-[2px]
                transition-[background-color,color,transform]
                duration-500
                ease-[cubic-bezier(0.22,1,0.36,1)]
                hover:-translate-y-1
                hover:bg-brand
                hover:text-brand-contrast
                hover:shadow-card
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-focus
                focus-visible:ring-offset-3
                active:translate-y-0
              "
            >
              {
                content.hero.actions
                  .learnMore
              }
            </Link>
          </div>
        </div>
      </div>

      <button
        type="button"
        aria-label={
          content.accessibility
            .scrollToNextSection
        }
        onClick={
          handleScrollDown
        }
        className="
          absolute bottom-[32px]
          left-1/2 z-20
          flex size-11
          -translate-x-1/2
          items-center
          justify-center
          rounded-full
          text-heading-secondary
          transition-colors
          duration-500
          hover:bg-surface/50
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-focus
          motion-safe:animate-[hero-chevron_1.8s_ease-in-out_infinite]
        "
      >
        <FaChevronDown
          aria-hidden="true"
          className="size-[16px]"
        />
      </button>
    </section>
  );
}