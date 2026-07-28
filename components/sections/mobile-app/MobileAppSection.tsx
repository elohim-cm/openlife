"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { useSiteContent } from "@/hooks/useSiteContent";
import {
  MOBILE_APP_FEATURES,
  MOBILE_APP_STORES,
} from "./mobile-app.data";
import { RotatingPhones } from "./RotatingPhones";

export function MobileAppSection() {
  const content = useSiteContent();
  const reduceMotion = Boolean(useReducedMotion());

  const features = MOBILE_APP_FEATURES.map(
    (definition, index) => ({
      ...definition,
      title:
        content.mobileApp.features[index]?.title ??
        "",
      description:
        content.mobileApp.features[index]
          ?.description ?? "",
    }),
  );

  const stores = MOBILE_APP_STORES.map(
    (definition, index) => ({
      ...definition,
      eyebrow:
        content.mobileApp.stores[index]?.eyebrow ??
        "",
      label:
        content.mobileApp.stores[index]?.label ??
        "",
      ariaLabel:
        content.mobileApp.stores[index]
          ?.ariaLabel ?? "",
    }),
  );

  return (
    <section
      id="mobile-application"
      aria-labelledby="mobile-application-title"
      className="relative overflow-hidden bg-background"
    >
      <div className="mx-auto grid min-h-[760px] w-full max-w-[1500px] grid-cols-1 lg:grid-cols-[47%_53%]">
        <div className="relative z-10 flex flex-col justify-center px-5 py-20 sm:px-8 lg:px-10 lg:py-24">
          <div className="mx-auto w-full max-w-[670px] lg:mx-0">
            <motion.h2
              id="mobile-application-title"
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, y: 24 }
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
                duration: reduceMotion ? 0 : 0.6,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="max-w-[650px] text-[38px] font-bold leading-[1.08] tracking-[-0.035em] text-heading sm:text-[46px] lg:text-[48px]"
            >
              {content.mobileApp.title}
            </motion.h2>

            <div
              aria-hidden="true"
              className="mt-[8px] flex items-center gap-[10px]"
            >
              <span className="h-[7px] w-[49px] bg-brand" />
              <span className="h-[7px] w-[140px] bg-brand" />
            </div>

            <div className="mt-[41px] space-y-[36px]">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.article
                    key={`${feature.id}-${feature.title}`}
                    initial={
                      reduceMotion
                        ? false
                        : {
                            opacity: 0,
                            x: -26,
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
                      duration: reduceMotion
                        ? 0
                        : 0.5,
                      delay: reduceMotion
                        ? 0
                        : index * 0.1,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="flex items-start gap-[15px]"
                  >
                    <div className="theme-icon-gradient flex size-[52px] shrink-0 items-center justify-center rounded-full text-accent-contrast shadow-button">
                      <Icon
                        aria-hidden="true"
                        className="size-[20px]"
                      />
                    </div>

                    <div className="pt-[7px]">
                      <h3 className="text-[18px] font-bold leading-[1.25] text-heading-secondary">
                        {feature.title}
                      </h3>

                      <p className="mt-[7px] text-[15px] leading-[1.55] text-text-muted sm:text-[16px]">
                        {feature.description}
                      </p>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <div className="mt-[42px] flex flex-wrap gap-[15px]">
              {stores.map((store) => {
                const Icon = store.icon;

                return (
                  <Link
                    key={`${store.id}-${store.label}`}
                    href={store.href}
                    aria-label={store.ariaLabel}
                    className="group flex min-h-[65px] min-w-[198px] items-center gap-[14px] rounded-[11px] border border-border bg-surface-elevated px-[22px] shadow-card transition-[transform,box-shadow,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:-translate-y-1 hover:border-border-strong hover:shadow-card-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-3"
                  >
                    <Icon
                      aria-hidden="true"
                      className="size-[27px] shrink-0 text-accent transition-transform duration-300 group-hover:scale-105"
                    />

                    <span className="flex flex-col">
                      <span className="text-[10px] font-medium uppercase tracking-[0.04em] text-text-subtle">
                        {store.eyebrow}
                      </span>

                      <span className="mt-[1px] text-[16px] font-bold leading-none text-heading-secondary">
                        {store.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mobile-app-theme-background relative flex min-h-[650px] items-center justify-center overflow-hidden lg:min-h-[760px]">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute bottom-[-180px] right-[-140px] size-[430px] rounded-full bg-brand-muted/45 blur-3xl"
          />

          <div className="relative z-10 w-full max-w-[760px]">
            <RotatingPhones />
          </div>
        </div>
      </div>
    </section>
  );
}