"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";

import {
  Accordion,
} from "@/components/ui/accordion";
import {
  useSiteContent,
} from "@/hooks/useSiteContent";

import {
  FaqPageItem,
  type FaqPageEntry,
} from "./FaqPageItem";

export function FaqPageSection() {
  const content = useSiteContent();

  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const items:
    readonly FaqPageEntry[] =
      content.faqPage.items;

  return (
    <section
      aria-labelledby="faq-page-title"
      className="
        relative overflow-hidden
        bg-background
        pb-[82px] pt-[132px]
        sm:pb-[100px]
        sm:pt-[144px]
        lg:pb-[118px]
        lg:pt-[150px]
      "
    >
      <div aria-hidden="true" className="
          pointer-events-none
          absolute left-1/2 top-[80px]
          size-[480px]
          -translate-x-1/2
          rounded-full
          bg-cta-soft
          blur-[120px]
        "
      />

      <div
        className="
          relative z-10
          mx-auto w-full
          max-w-[1500px]
          px-5
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
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration:
              reduceMotion
                ? 0
                : 0.7,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="text-center"
        >
          <h1
            id="faq-page-title"
            className="
              text-[31px] font-bold
              leading-tight
              tracking-[-0.035em]
              text-heading
              sm:text-[38px]
              lg:text-[45px]
            "
          >
            {content.faqPage.title}
          </h1>

          <div
            aria-hidden="true"
            className="
              mt-[10px] flex
              items-center justify-center
              gap-[8px]
            "
          >
            <span
              className="
                h-[6px] w-[36px]
                bg-brand
              "
            />

            <span
              className="
                h-[6px] w-[104px]
                bg-brand
              "
            />
          </div>

          <p
            className="
              mt-[17px]
              text-[14px]
              text-text-muted
              sm:text-[15px]
              lg:text-[16px]
            "
          >
            {content.faqPage.subtitle}
          </p>
        </motion.header>

        <Accordion
          type="single"
          collapsible
          className="
            mx-auto mt-[45px]
            space-y-[12px]
            sm:mt-[52px]
            lg:mt-[56px]
          "
        >
          {items.map(
            (item, index) => (
              <motion.div
                key={item.id}
                initial={
                  reduceMotion
                    ? false
                    : {
                        opacity: 0,
                        y: 22,
                      }
                }
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                  amount: 0.2,
                }}
                transition={{
                  duration:
                    reduceMotion
                      ? 0
                      : 0.55,
                  delay:
                    reduceMotion
                      ? 0
                      : Math.min(
                          index *
                            0.045,
                          0.22,
                        ),
                  ease: [
                    0.22,
                    1,
                    0.36,
                    1,
                  ],
                }}
              >
                <FaqPageItem
                  item={item}
                  number={
                    index + 1
                  }
                />
              </motion.div>
            ),
          )}
        </Accordion>
      </div>
    </section>
  );
}