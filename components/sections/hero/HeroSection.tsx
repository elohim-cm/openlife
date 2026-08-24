"use client";

import {
  ChartNoAxesCombined,
  Clock3,
  ShieldCheck,
  UserRound,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";

import {
  useSiteContent,
} from "@/hooks/useSiteContent";

import {
  HeroFeatureCard,
} from "./HeroFeatureCard";
import {
  HeroPhoneVisual,
} from "./HeroPhoneVisual";
import {
  HeroTrustBar,
} from "./HeroTrustBar";

const HERO_FEATURE_ICONS:
  Record<string, LucideIcon> = { "minimum-deposit":WalletCards, "interest-rate":ChartNoAxesCombined,withdrawal: Clock3,};

const HERO_LINKS = {
  simulation: "/simuler",
  learnMore: "/faq",
} as const;

export function HeroSection() {
  const content = useSiteContent();

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="
        relative isolate
        w-full
        bg-[var(--hero-stage-background)]
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0
          overflow-hidden
        "
      >

        <div
          className="
            hero-mobile-initial-photo
            absolute inset-x-0 top-0
          "
        />
        
        <div
          className="
            hero-green-shape
            absolute inset-0
          "
        />

        <div
          className="
            hero-contour-pattern
            absolute inset-0
          "
        />

        <div
          className="
            absolute
            bottom-0 left-[43%]
            hidden h-[230px]
            w-[170px]
            rounded-t-full
            bg-[radial-gradient(ellipse_at_bottom,var(--hero-plant-glow),transparent_68%)]
            opacity-60
            lg:block
          "
        />
      </div>

      <div
        className="
          relative z-10
          mx-auto grid
          w-full max-w-[1450px]
          grid-cols-1
          items-center
          gap-8
          px-5 pb-4
          pt-[100px]
          sm:px-8
          sm:pt-[100px]
          md:pt-[100px]
          lg:min-h-[825px]
          lg:grid-cols-[47%_53%]
          lg:gap-0
          lg:px-10
          lg:pb-[130px]
          lg:pt-[22px]
        "
      >
        <div
          className="
            relative z-20
            max-w-[610px]
          "
        >
          <div
            className="
              hero-reveal
              hero-reveal-delay-1
              inline-flex
              items-center gap-2
              rounded-full
              border
              border-[var(--hero-badge-border)]
              bg-[var(--hero-badge-background)]
              px-4 py-2
              text-brand
              backdrop-blur-[5px]
            "
          >
            <ShieldCheck
              aria-hidden="true"
              className="size-[17px]"
              strokeWidth={2.1}
            />

            <span
              className="
                text-[11px]
                font-semibold
                tracking-[0.11em]
                sm:text-[12px]
              "
            >
              {content.hero.accreditation}
            </span>
          </div>

          <h1
            id="hero-title"
            className="
              hero-reveal
              hero-reveal-delay-2
              mt-3
              text-[62px]
              font-extrabold
              leading-[0.98]
              tracking-[-0.055em]
              text-heading
              sm:text-[76px]
            "
          >
            {content.hero.title}
          </h1>

          <p
            className="
              hero-reveal
              hero-reveal-delay-3
              mt-5
              max-w-[520px]
              whitespace-pre-line
              text-[20px]
              leading-[1.28]
              tracking-[-0.035em]
              text-heading-secondary
            "
          >
            {content.hero.tagline}
          </p>

          <div
            className="
              hero-reveal
              hero-reveal-delay-4
              mt-4 space-y-3.5
            "
          >
            {content.hero.features.map(
              (feature) => {
                const Icon =
                  HERO_FEATURE_ICONS[
                    feature.id
                  ];

                if (!Icon) {
                  return null;
                }

                return (
                  <HeroFeatureCard
                    key={feature.id}
                    icon={Icon}
                    label={feature.label}
                  />
                );
              },
            )}
          </div>

          <div
            className="
              hero-reveal
              hero-reveal-delay-5
              mt-7 flex
              flex-wrap
              items-center gap-4
            "
          >
            <Link
              href={
                HERO_LINKS.simulation
              }
              aria-label={
                content.hero.actions
                  .simulationLabel
              }
              className="
                group inline-flex
                min-h-[58px]
                items-center
                justify-center
                gap-3
                rounded-[12px]
                bg-cta
                px-7
                text-[15px]
                font-semibold
                text-cta-contrast
                shadow-button
                transition-[background-color,transform,box-shadow]
                duration-500
                ease-[cubic-bezier(0.16,1,0.3,1)]
                hover:-translate-y-1
                hover:bg-cta-hover
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-focus
                focus-visible:ring-offset-3
                active:translate-y-0
              "
            >
              <UserRound
                aria-hidden="true"
                className="size-[18px]"
                strokeWidth={2}
              />

              <span>
                {
                  content.hero.actions
                    .simulation
                }
              </span>
            </Link>

            <Link
              href={HERO_LINKS.learnMore}
              aria-label={
                content.hero.actions
                  .learnMoreLabel
              }
              className="
                inline-flex
                min-h-[58px]
                items-center
                justify-center
                rounded-[12px]
                border
                border-brand
                bg-[var(--hero-secondary-button)]
                px-7
                text-[15px]
                font-semibold
                text-brand
                backdrop-blur-[4px]
                transition-[background-color,color,transform,box-shadow]
                duration-500
                ease-[cubic-bezier(0.16,1,0.3,1)]
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

        <div
          className="
            relative z-10
            mt-10 block min-w-0
            lg:mt-0
          "
        >
          <HeroPhoneVisual />
        </div>
      </div>

      <div
        className="
          relative z-40
          mx-auto mt-1
          w-[calc(100%-40px)]
          pb-8
          sm:w-[calc(100%-64px)]
          lg:absolute
          lg:bottom-[24px]
          lg:left-1/2
          lg:mt-0
          lg:-translate-x-1/2
          lg:pb-0
        "
      >
        <HeroTrustBar />
      </div>
    </section>
  );
}
