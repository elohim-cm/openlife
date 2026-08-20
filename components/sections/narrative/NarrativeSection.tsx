"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useRef } from "react";
import {
  FaBullseye,
  FaChartLine,
  FaCheck,
} from "react-icons/fa";

import { useSiteContent } from "@/hooks/useSiteContent";

const NARRATIVE_IMAGES = {
  today: "/images/narrative/image.webp",
  tomorrow: "/images/narrative/who-we-are.jpg",
} as const;

export function NarrativeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const content = useSiteContent();
  const reduceMotion = Boolean(useReducedMotion(),);

  const {scrollYProgress,} = useScroll({
    target: sectionRef,
    offset: ["start start","end end",],
  });

  const smoothScrollProgress =
    useSpring(
      scrollYProgress,
      {
        stiffness: 95,
        damping: 28,
        mass: 0.28,
      },
    );

  /*
  * L’animation se termine à 68 %
  * de la zone sticky.
  *
  * De 68 % à 100 %, le dernier
  * état reste entièrement visible.
  */
  const storyProgress = useTransform(
    smoothScrollProgress,
    [0, 0.78],
    [0, 1],
    { clamp: true },
  );

  const firstMessageFontSize =
    useTransform(
      storyProgress,
      [0, 1],
      [
        "clamp(1.7rem, 3.6vw, 3.625rem)",
        "clamp(0.95rem, 1.25vw, 1.125rem)",
      ],
    );

  const firstMessageLineHeight =
    useTransform(
      storyProgress,
      [0, 1],
      [1.14, 1.45],
    );

  const firstMessageOpacity =
    useTransform(
      storyProgress,
      [0, 0.72, 1],
      [1, 0.9, 0.82],
    );

  const secondMessageFontSize =
    useTransform(
      storyProgress,
      [0, 1],
      [
        "clamp(0.95rem, 1.25vw, 1.125rem)",
        "clamp(1.7rem, 3.6vw, 3.625rem)",
      ],
    );

  const secondMessageLineHeight =
    useTransform(
      storyProgress,
      [0, 1],
      [1.45, 1.14],
    );

  const secondMessageOpacity =
    useTransform(
      storyProgress,
      [0, 0.3, 1],
      [0.78, 1, 1],
    );

  const todayActiveOpacity =
    useTransform(
      storyProgress,
      [0, 0.42, 0.65],
      [1, 1, 0],
    );

  const tomorrowActiveOpacity =
    useTransform(
      storyProgress,
      [0, 0.42, 0.65],
      [0, 0, 1],
    );

  const timelineScaleY =
    useTransform(
      storyProgress,
      [0, 1],
      [0, 1],
    );

  const tomorrowImageOpacity =
    useTransform(
      storyProgress,
      [0, 0.38, 0.68, 1],
      [0, 0, 1, 1],
    );

  const todayCardOpacity =
    useTransform(
      storyProgress,
      [0, 0.42, 0.58],
      [1, 1, 0],
    );

  const tomorrowCardOpacity =
    useTransform(
      storyProgress,
      [0, 0.42, 0.58, 1],
      [0, 0, 1, 1],
    );

  const cardY = useTransform(
    storyProgress,
    [0, 0.5, 1],
    [0, -6, 0],
  );

  const firstMessage =
    content.narrative.phrases[1] ??
    "";

  const secondMessage =
    content.narrative.phrases[0] ??
    "";

  return (
    <section
      ref={sectionRef}
      id="openlife-narrative"
      aria-labelledby="openlife-narrative-title"
      className="
        relative isolate
        bg-background
      "
      style={{
        height: reduceMotion
          ? "100svh"
          : "330svh",
      }}
    >
      <h2
        id="openlife-narrative-title"
        className="sr-only"
      >
        {
          content.narrative
            .accessibilityTitle
        }
      </h2>

      <div
        className="
          sticky top-0 isolate
          h-[100svh]
          min-h-[640px]
          w-full
          overflow-hidden
          sm:min-h-[700px]
        "
      >
        <Image
          src={NARRATIVE_IMAGES.today}
          alt=""
          fill
          sizes="100vw"
          className="
            -z-30
            object-cover
            object-[64%_center]
          "
        />

        <motion.div
          aria-hidden="true"
          className="
            absolute inset-0 -z-20
          "
          style={{
            opacity:
              reduceMotion
                ? 0
                : tomorrowImageOpacity,
          }}
        >
          <Image
            src={
              NARRATIVE_IMAGES.tomorrow
            }
            alt=""
            fill
            sizes="100vw"
            className="
              object-cover
              object-center
            "
          />
        </motion.div>

        <div
          aria-hidden="true"
          className="
            openlife-narrative-overlay
            absolute inset-0 -z-10
          "
        />

        <div
          className="
            mx-auto grid
            h-full w-full
            max-w-[1500px]
            grid-cols-[84px_minmax(0,1fr)]
            px-4 pb-4 pt-[150px]
            sm:grid-cols-[150px_minmax(0,1fr)]
            sm:px-8
            sm:py-16
            lg:grid-cols-[180px_minmax(0,720px)_1fr]
            lg:px-10
            lg:py-[72px]
          "
        >
          <div
            aria-hidden="true"
            className="
              relative
              col-start-1
              row-start-1
              h-full
            "
          >
            <span
              className="
                absolute
                left-[22px]
                top-[23px]
                h-[154px]
                w-px
                bg-cta-contrast/32
                sm:left-[28px]
                sm:top-[79px]
                sm:h-[270px]
                lg:left-[34px]
              "
            />

            <motion.span
              className="
                absolute
                left-[22px]
                top-[23px]
                h-[154px]
                w-px
                origin-top
                bg-cta-contrast
                sm:left-[28px]
                sm:top-[79px]
                sm:h-[270px]
                lg:left-[34px]
              "
              style={{ scaleY: reduceMotion? 0.08: timelineScaleY,}}
            />

            <motion.div
              className="
                absolute
                left-0 top-0
                flex items-center
                sm:top-13
                sm:gap-4
              "
            >
              <span
                className="
                  relative flex
                  size-[46px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-cta-contrast
                  bg-cta-contrast
                  text-brand
                  shadow-[0_8px_25px_rgba(0,0,0,0.18)]
                  sm:size-[54px]
                "
              >
                <motion.span
                  className="flex items-center justify-center"
                  style={{ opacity: reduceMotion ? 1 : todayActiveOpacity, }}
                >
                  <FaCheck
                    className=" size-[17px] sm:size-[20px]"
                  />
                </motion.span>
              </span>

              <span
                className="
                  hidden
                  whitespace-nowrap
                  text-[13px]
                  font-semibold
                  text-cta-contrast
                  sm:block
                  sm:text-[15px]
                "
              >
                {content.narrative.todayLabel}
              </span>
            </motion.div>

            <motion.div
              className="
                absolute
                left-[11px] top-[165px]
                flex items-center
                sm:left-[17px]
                sm:top-[337px]
                sm:gap-4
                lg:left-[23px]
              "
            >
              <span
                className="
                  relative flex
                  size-[23px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  border-2
                  border-cta-contrast
                  bg-transparent
                "
              >
                <span
                  className="
                    size-[7px]
                    rounded-full
                    bg-cta-contrast
                  "
                />

                <motion.span
                  className="
                    absolute -inset-[13px]
                    flex items-center
                    justify-center
                    rounded-full
                    border-2
                    border-cta-contrast
                    bg-brand
                  "
                  style={{
                    opacity: reduceMotion
                      ? 0
                      : tomorrowActiveOpacity,
                  }}
                >
                  <FaCheck
                    className="
                      size-[15px]
                      text-cta-contrast
                    "
                  />
                </motion.span>
              </span>

              <span
                className="
                  hidden
                  whitespace-nowrap
                  text-[12px]
                  font-semibold
                  text-cta-contrast/72
                  sm:block
                  sm:text-[15px]
                "
              >
                {content.narrative.tomorrowLabel}
              </span>
            </motion.div>
          </div>

          <div
            className="
              relative
              col-start-2
              row-start-1
              h-full
              min-w-0
              lg:col-start-2
            "
          >
            <span
              className="
                absolute left-0 top-0
                whitespace-nowrap
                text-[12px]
                font-semibold
                text-cta-contrast
                sm:hidden
              "
            >
              {content.narrative.todayLabel}
            </span>

            <motion.p
              className="
                absolute
                left-0 top-[28px]
                w-full max-w-[760px]
                text-balance
                font-bold
                tracking-[-0.045em]
                text-cta-contrast
                drop-shadow-[0_4px_18px_rgba(0,0,0,0.22)]
                sm:top-[52px]
              "
              style={{
                fontSize: reduceMotion
                  ? "clamp(1.7rem, 3.6vw, 3.625rem)"
                  : firstMessageFontSize,
                lineHeight: reduceMotion
                  ? 1.14
                  : firstMessageLineHeight,
                opacity: reduceMotion
                  ? 1
                  : firstMessageOpacity,
              }}
            >
              {firstMessage}
            </motion.p>

            <span
              className="
                absolute left-0 top-[165px]
                whitespace-nowrap
                text-[12px]
                font-semibold
                text-cta-contrast/82
                sm:hidden
              "
            >
              {content.narrative.tomorrowLabel}
            </span>

            <motion.p
              className="
                absolute
                left-0 top-[193px]
                w-full max-w-[760px]
                font-medium
                tracking-[-0.02em]
                text-cta-contrast/86
                sm:top-[245px]
              "
              style={{
                fontSize: reduceMotion
                  ? "clamp(0.95rem, 1.25vw, 1.125rem)"
                  : secondMessageFontSize,
                lineHeight: reduceMotion
                  ? 1.45
                  : secondMessageLineHeight,
                opacity: reduceMotion
                  ? 0.78
                  : secondMessageOpacity,
              }}
            >
              {secondMessage}
            </motion.p>

            <motion.div
              className="
                absolute
                bottom-[18px]
                left-[calc(50%_-_42px)]
                h-[146px]
                w-[calc(100vw_-_32px)]
                max-w-[360px]
                -translate-x-1/2
                overflow-hidden
                rounded-[18px]
                border border-cta-contrast/24
                bg-brand-strong/62
                shadow-[0_20px_45px_rgba(0,0,0,0.20)]
                backdrop-blur-[8px]
                dark:bg-surface/78
                sm:bottom-[42px]
                sm:left-1/2
                sm:w-[calc(100%_-_32px)]
                sm:max-w-[510px]
              "
            >
              <motion.div
                className="
                  absolute inset-0
                  flex items-center
                  gap-4 p-4
                  sm:gap-6
                  sm:p-6
                "
                style={{
                  opacity: reduceMotion
                    ? 1
                    : todayCardOpacity,
                }}
              >
                <span
                  className="
                    flex size-[62px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border-4
                    border-success
                    bg-cta-contrast
                    text-success
                    sm:size-[72px]
                  "
                >
                  <FaCheck
                    className="
                      size-[24px]
                      sm:size-[28px]
                    "
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      text-[12px]
                      font-medium
                      text-cta-contrast/82
                      sm:text-[14px]
                    "
                  >
                    {
                      content.narrative
                        .todayCard.title
                    }
                  </p>

                  <p
                    className="
                      mt-1
                      text-[26px]
                      font-bold
                      leading-none
                      text-cta-contrast
                      sm:text-[31px]
                    "
                  >
                    {
                      content.narrative
                        .todayCard.value
                    }
                  </p>

                  <p
                    className="
                      mt-2
                      text-[11px]
                      leading-[1.4]
                      text-cta-contrast/72
                      sm:text-[12px]
                    "
                  >
                    {
                      content.narrative
                        .todayCard.description
                    }
                  </p>
                </div>

                <FaChartLine
                  aria-hidden="true"
                  className="
                    hidden size-[54px]
                    shrink-0
                    text-success
                    sm:block
                  "
                />
              </motion.div>

              <motion.div
                className="
                  absolute inset-0
                  flex items-center
                  gap-4 p-4
                  sm:gap-6
                  sm:p-6
                "
                style={{
                  opacity: reduceMotion
                    ? 0
                    : tomorrowCardOpacity,
                }}
              >
                <span
                  className="
                    flex size-[62px]
                    shrink-0
                    items-center
                    justify-center
                    rounded-full
                    border-4
                    border-brand
                    bg-cta-contrast
                    text-brand
                    sm:size-[72px]
                  "
                >
                  <FaBullseye
                    className="
                      size-[26px]
                      sm:size-[31px]
                    "
                  />
                </span>

                <div className="min-w-0 flex-1">
                  <p
                    className="
                      text-[12px]
                      font-medium
                      text-cta-contrast/82
                      sm:text-[14px]
                    "
                  >
                    {
                      content.narrative
                        .tomorrowCard.title
                    }
                  </p>

                  <p
                    className="
                      mt-1
                      text-[19px]
                      font-bold
                      leading-tight
                      text-cta-contrast
                      sm:text-[25px]
                    "
                  >
                    {
                      content.narrative
                        .tomorrowCard.value
                    }
                  </p>

                  <p
                    className="
                      mt-2
                      text-[11px]
                      leading-[1.4]
                      text-cta-contrast/72
                      sm:text-[12px]
                    "
                  >
                    {
                      content.narrative
                        .tomorrowCard.description
                    }
                  </p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}