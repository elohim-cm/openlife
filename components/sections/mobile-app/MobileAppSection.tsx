"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import Link from "next/link";

import { useSiteContent } from "@/hooks/useSiteContent";

import {
  MOBILE_APP_FEATURES,
  MOBILE_APP_STORES,
} from "./mobile-app.data";
import { RotatingPhones } from "./RotatingPhones";

export function MobileAppSection() {
  const content = useSiteContent();
  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const features =
    MOBILE_APP_FEATURES.map(
      (definition, index) => ({
        ...definition,
        title:
          content.mobileApp
            .features[index]
            ?.title ?? "",
        description:
          content.mobileApp
            .features[index]
            ?.description ?? "",
      }),
    );

  const stores =
    MOBILE_APP_STORES.map(
      (definition, index) => ({
        ...definition,
        eyebrow:
          content.mobileApp
            .stores[index]
            ?.eyebrow ?? "",
        label:
          content.mobileApp
            .stores[index]
            ?.label ?? "",
        ariaLabel:
          content.mobileApp
            .stores[index]
            ?.ariaLabel ?? "",
      }),
    );

  return (
    <section
      id="mobile-application"
      aria-labelledby="mobile-application-title"
      className="
        mobile-app-theme-background
        relative isolate
        overflow-hidden
        text-cta-contrast
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_75%_52%,rgba(80,190,72,0.16),transparent_34%)]
          dark:bg-[radial-gradient(circle_at_75%_52%,rgba(105,193,87,0.10),transparent_36%)]
        "
      />

      <div
        className="
          mx-auto grid
          min-h-[780px]
          w-full max-w-[1500px]
          grid-cols-1
          lg:grid-cols-[42%_58%]
        "
      >
        <div
          className="
            relative z-20
            flex flex-col
            justify-center
            px-5 py-10
            sm:px-8
            lg:px-10
            lg:py-24
          "
        >
          <div
            className="
              mx-auto w-full
              max-w-[620px]
              lg:mx-0
            "
          >
            <motion.h2
            id="mobile-application-title"
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
              amount: 0.6,
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
              max-w-[610px]
              text-[38px]
              font-extrabold
              leading-[1.02]
              tracking-[-0.045em]
              text-[var(--mobile-title)]
            "
          >
            <span className="block">
              {content.mobileApp.titleStart}
            </span>

            <span className="mt-2 block">
              {content.mobileApp.titleHighlight}
            </span>

            <span
              aria-hidden="true"
              className="
                mt-4 flex
                items-center gap-4
              "
            >
              <span
                className="
                  block h-[7px]
                  w-[74px]
                  bg-current
                "
              />

              <span
                className="
                  block h-[7px]
                  w-[210px]
                  max-w-[48%]
                  bg-current
                "
              />
            </span>
          </motion.h2>

            <div
              className="
                mt-12 space-y-9
              "
            >
              {features.map(
                (feature, index) => {
                  const Icon =
                    feature.icon;

                  return (
                    <motion.article
                      key={feature.id}
                      initial={
                        reduceMotion
                          ? false
                          : {
                              opacity: 0,
                              x: -24,
                            }
                      }
                      whileInView={{
                        opacity: 1,
                        x: 0,
                      }}
                      viewport={{
                        once: true,
                        amount: 0.5,
                      }}
                      transition={{
                        duration:
                          reduceMotion
                            ? 0
                            : 0.6,
                        delay:
                          reduceMotion
                            ? 0
                            : index * 0.1,
                        ease: [
                          0.16,
                          1,
                          0.3,
                          1,
                        ],
                      }}
                      className="
                        flex items-start
                        gap-5
                      "
                    >
                      <div
                        className="
                          flex size-[68px]
                          shrink-0
                          items-center
                          justify-center
                          rounded-[19px]
                          border
                          border-cta-contrast/28
                          bg-cta-contrast/5
                          text-cta-contrast
                          shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]
                          backdrop-blur-[4px]
                        "
                      >
                        <Icon
                          aria-hidden="true"
                          className="
                            size-[27px]
                          "
                        />
                      </div>

                      <div className="pt-1">
                        <h3
                          className="
                          text-[20px]
                          font-extrabold
                          leading-[1.2]
                          tracking-[-0.02em]
                          text-[var(--mobile-feature-title)]
                          sm:text-[23px]
"
                        >
                          {feature.title}
                        </h3>

                        <p
                          className="
                          mt-3
                          max-w-[460px]
                          text-[16px]
                          font-medium
                          leading-[1.55]
                          tracking-[-0.01em]
                          text-[var(--mobile-description)]
                          sm:text-[18px]
"
                        >
                          {
                            feature.description
                          }
                        </p>
                      </div>
                    </motion.article>
                  );
                },
              )}
            </div>

            <div
              className="
                mt-12 grid
                w-full grid-cols-2
                gap-3
                sm:gap-4
              "
            >
              {stores.map((store) => {
                const Icon = store.icon;

                return (
                  <Link
                    key={store.id}
                    href={store.href}
                    aria-label={
                      store.ariaLabel
                    }
                    className="
                      group flex
                      min-h-[68px]
                      min-w-0 w-full
                      items-center gap-2.5
                      sm:min-h-[76px]
                      sm:gap-4
                      rounded-[14px]
                      border border-cta-contrast/35
                      bg-[var(--mobile-store-background)]
                      px-3
                      sm:px-6
                      text-[var(--mobile-store-text)]
                      shadow-[0_14px_32px_rgba(0,0,0,0.18)]
                      transition-[transform,box-shadow,background-color]
                      hover:-translate-y-1
                      hover:bg-[var(--mobile-store-background-hover)]
                      hover:shadow-[0_20px_40px_rgba(0,0,0,0.24)]
                      focus-visible:outline-none
                      focus-visible:ring-2
                      focus-visible:ring-cta-contrast
                      focus-visible:ring-offset-4
                      focus-visible:ring-offset-brand-strong
                    "
                  >
                    <Icon
                      aria-hidden="true"
                      className="
                        size-[24px]
                        shrink-0
                        transition-transform
                        group-hover:scale-105
                        sm:size-[31px]
                      "
                    />

                    <span
                      className="
                        flex flex-col
                      "
                    >
                      <span
                        className="
                          text-[8px]
                          font-medium
                          leading-none
                          opacity-70
                          sm:text-[11px]
                        "
                      >
                        {store.eyebrow}
                      </span>

                      <span
                        className="
                          mt-1
                          whitespace-nowrap
                          text-[14px]
                          font-bold
                          leading-none
                          sm:text-[20px]
                        "
                      >
                        {store.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div
          className="
            relative flex
            min-h-[60px]
            items-center
            justify-center
            overflow-hidden
            lg:min-h-[780px]
          "
        >
          <div
            className="
              relative z-10
              w-full
              max-w-[850px]
            "
          >
            <RotatingPhones />
          </div>
        </div>
      </div>
    </section>
  );
}