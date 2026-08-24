"use client";

import {
  AnimatePresence,
  motion,
} from "framer-motion";
import Image from "next/image";
import { useMemo } from "react";
import {
  Calculator,
  FilePenLine,
  HandCoins,
  LayoutGrid,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import {
  useScrollStory,
} from "@/hooks/useScrollStory";
import {
  useSiteContent,
} from "@/hooks/useSiteContent";

import {
  EXPERIENCE_ASSETS,
  type ExperienceItem,
} from "./experience.data";

export function ExperienceSection() {
  const content = useSiteContent();

  const experienceItems =
    useMemo<
      readonly ExperienceItem[]
    >(() => {
      return EXPERIENCE_ASSETS.map(
        (asset, index) => {const translatedItem =content.experience.items[index];
          return {
            id: asset.id,
            imageSrc:
              asset.imageSrc,
            title:
              translatedItem
                ?.title ?? "",
            description:
              translatedItem
                ?.description ?? "",
            imageAlt:
              translatedItem
                ?.imageAlt ?? "",
          };
        },
      );
    }, [content.experience.items]);

  const {
    sectionRef,
    activeIndex,
    direction,
    scrollToStep,
  } = useScrollStory({
    stepsCount:
      experienceItems.length,
  });

  const activeItem =
    experienceItems[activeIndex];

  if (!activeItem) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      id="openlife-experience"
      aria-labelledby="openlife-experience-title"
      className="
        relative
        bg-[var(--experience-background)]
      "
      style={{
        height: `${experienceItems.length * 100}svh`,
      }}
    >
      <div
        className="
          sticky top-0
          flex h-[100svh]
          w-full flex-col
          overflow-hidden
          bg-[var(--experience-background)]
        "
      >
        {/* Cerceau rouge */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            -left-[190px]
            -top-[250px]
            size-[360px]
            rounded-full
            bg-cta
            sm:size-[520px]
            lg:-left-[520px]
            lg:-top-[1050px]
            lg:size-[1150px]
          "
        />
        {/* Cerceau vert */}
        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            top-[104px]
            size-[1100px]
            rounded-full
            bg-[var(--experience-curve)]
            sm:top-auto
            lg:-bottom-[120%]
            sm:-bottom-[100%]
            lg:-right-[24%]
          "
        />

        <div
          aria-hidden="true"
          className="
            pointer-events-none
            absolute inset-0
            bg-[radial-gradient(circle_at_28%_42%,var(--experience-glow),transparent_36%)]
          "
        />

        <div
          className="
            relative z-10
            mx-auto flex h-full
            w-full max-w-[1540px]
            flex-col
            px-5 pt-[28px]
            sm:px-8
            lg:px-10
          "
        >
          <header
            className="
              shrink-0 text-center
            "
          >
            <h2
              id="openlife-experience-title"
              className="
                text-[25px] font-bold
                leading-tight
                tracking-[-0.025em]
                text-heading
                sm:text-[28px]
                lg:text-[31px]
              "
            >
              {content.experience.title}
            </h2>

            <div
              aria-hidden="true"
              className="
                mt-[9px]
                flex items-center
                justify-center
                gap-[8px]
              "
            >
              <span
                className="
                  h-[6px] w-[35px]
                  bg-brand
                "
              />

              <span
                className="
                  h-[6px] w-[100px]
                  bg-brand
                "
              />
            </div>
          </header>

          <div
            className="
              grid min-h-0
              flex-1 items-center
              pt-7
              lg:grid-cols-[180px_330px_minmax(0,1fr)]
              lg:gap-8
              lg:pt-10
              xl:grid-cols-[190px_350px_minmax(0,1fr)]
              xl:gap-12
            "
          >
            <ExperienceProgress
              items={experienceItems}
              activeIndex={activeIndex}
              label={
                content.experience
                  .progressLabel
              }
              onStepSelect={scrollToStep}
            />

            <ExperienceText
              item={activeItem}
              direction={direction}
            />

            <ExperienceImage
              item={activeItem}
              direction={direction}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

type AnimatedPartProps = {
  item: ExperienceItem;
  direction: 1 | -1;
};

type ExperienceProgressProps = {
  items:
    readonly ExperienceItem[];
  activeIndex: number;
  label: string;
  onStepSelect: (index: number) => void;
};

function ExperienceProgress({
  items,
  activeIndex,
  label,
  onStepSelect,
}: ExperienceProgressProps) {
  return (
    <nav
      aria-label={label}
      className="w-full"
    >
      <ol
        className="
          hidden flex-col
          lg:flex
        "
      >
        {items.map(
          (item, index) => {
            const isActive =
              index === activeIndex;
            const isPassed =
              index < activeIndex;
            const isLast =
              index ===
              items.length - 1;

            return (
              <li
                key={item.id}
                className="
                  relative flex
                  min-h-[82px]
                  items-start gap-4
                "
              >
                {!isLast && (
                  <span
                    aria-hidden="true"
                    className={`
                      absolute
                      left-[9px] top-[20px]
                      h-[62px]
                      border-l border-dashed
                      transition-colors
                      duration-500
                      ${
                        isPassed
                          ? "border-brand/70"
                          : "border-[var(--experience-progress-line)]"
                      }
                    `}
                  />
                )}

                <button
                  type="button"
                  aria-current={
                    isActive
                      ? "step"
                      : undefined
                  }
                  onClick={() =>
                    onStepSelect(index)
                  }
                  className="
                    relative z-10 flex
                    min-h-11 items-start
                    gap-4 text-left
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-focus
                    focus-visible:ring-offset-4
                  "
                >
                  <span
                    aria-hidden="true"
                    className={`
                      mt-[2px] block
                      size-[19px]
                      shrink-0 rounded-full
                      border
                      transition-[background-color,border-color,box-shadow,transform]
                      duration-700
                      ease-in-out
                      ${
                        isActive
                          ? `
                            scale-110
                            border-brand
                            bg-brand
                            shadow-[0_0_0_7px_var(--experience-progress-ring)]
                          `
                          : isPassed
                            ? `
                              border-brand
                              bg-brand/45
                            `
                            : `
                              border-[var(--experience-progress-dot)]
                              bg-[var(--experience-background)]
                            `
                      }
                    `}
                  />

                  <span
                    className={`
                      block pt-0.5
                      leading-[1.35]
                      transition-colors
                      duration-700
                      ease-in-out
                      ${
                        isActive
                          ? "font-bold text-icon"
                          : "text-text-muted"
                      }
                    `}
                  >
                    {item.title}
                  </span>
                </button>
              </li>
            );
          },
        )}
      </ol>

      <ol
        className="
          mx-auto flex
          max-w-[310px]
          items-center
          justify-between
          lg:hidden
        "
      >
        {items.map(
          (item, index) => {
            const isActive =
              index === activeIndex;
            const isPassed =
              index < activeIndex;
            const isLast =
              index ===
              items.length - 1;

            return (
              <li
                key={item.id}
                className="
                  relative flex flex-1
                  items-center
                  last:flex-none
                "
              >
                <button
                  type="button"
                  aria-label={item.title}
                  aria-current={
                    isActive
                      ? "step"
                      : undefined
                  }
                  onClick={() =>
                    onStepSelect(index)
                  }
                  className="
                    relative z-10 flex
                    size-11 shrink-0
                    items-center
                    justify-center
                    rounded-full
                    focus-visible:outline-none
                    focus-visible:ring-2
                    focus-visible:ring-focus
                  "
                >
                  <span
                    aria-hidden="true"
                    className={`
                      block size-[14px]
                      rounded-full border
                      transition-[background-color,border-color,box-shadow,transform]
                      duration-700
                      ease-in-out
                      ${
                        isActive
                          ? "scale-125 border-brand bg-brand shadow-[0_0_0_6px_var(--experience-progress-ring)]"
                          : isPassed
                            ? "border-brand bg-brand/50"
                            : "border-[var(--experience-progress-dot)] bg-[var(--experience-background)]"
                      }
                    `}
                  />
                </button>

                {!isLast && (
                  <span
                    className={`
                      h-px flex-1
                      transition-colors
                      duration-700
                      ease-in-out
                      ${
                        isPassed
                          ? "bg-brand/70"
                          : "bg-[var(--experience-progress-line)]"
                      }
                    `}
                  />
                )}
              </li>
            );
          },
        )}
      </ol>
    </nav>
  );
}

function ExperienceText({
  item,
  direction,
}: AnimatedPartProps) {
  const textDistance = 58;
  const iconsByItemId:
    Record<string, LucideIcon> = {
      dashboard: LayoutGrid,
      subscription: FilePenLine,
      simulation: Calculator,
      collection: WalletCards,
      redemption: HandCoins,
    };

  const ItemIcon =
    iconsByItemId[item.id] ??
    LayoutGrid;

  return (
    <div
      className="
        relative mx-auto
        min-h-[210px]
        w-full max-w-[350px]
        overflow-hidden
        rounded-[18px]
        border
        border-[var(--experience-card-border)]
        bg-[var(--experience-card)]
        shadow-[var(--experience-card-shadow)]
        backdrop-blur-[7px]
        sm:min-h-[230px]
        sm:max-w-[520px]
        lg:min-h-[330px]
        lg:max-w-none
      "
    >
      <AnimatePresence
        initial={false}
        mode="wait"
        custom={direction}
      >
        <motion.div
          key={item.id}
          custom={direction}
          initial={{
            opacity: 0,
            y:
              direction === 1
                ? textDistance
                : -textDistance,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          exit={{
            opacity: 0,
            y:
              direction === 1
                ? -textDistance
                : textDistance,
          }}
          transition={{
            duration: 0.68,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="
            absolute inset-0
            flex flex-col
            justify-center
            px-5 py-5
            sm:px-7
            sm:py-6
            lg:px-7
            xl:px-8
          "
        >
          <div
            className="
              flex items-center
              gap-3.5
              sm:gap-4
            "
          >
            <span
              aria-hidden="true"
              className="
                flex size-[44px]
                shrink-0
                items-center
                justify-center
                rounded-[11px]
                border border-brand/15
                bg-brand/[0.06]
                text-brand
                sm:size-[48px]
                sm:rounded-[12px]
                lg:size-[50px]
              "
            >
              <ItemIcon
                className="
                  size-[23px]
                  sm:size-[25px]
                "
                strokeWidth={2}
              />
            </span>

            <h3
              className="
                text-[23px]
                font-bold
                leading-[1.2]
                tracking-[-0.025em]
                text-heading-secondary
                sm:text-[26px]
                lg:text-[28px]
              "
            >
              {item.title}
            </h3>
          </div>

          <p
            className="
              mt-4
              text-[12px]
              leading-[1.7]
              text-text-muted
              sm:text-[15px]
              lg:text-[16px]
            "
          >
            {item.description}
          </p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function ExperienceImage({
  item,
  direction,
}: AnimatedPartProps) {
  const imageDistance = 80;

  return (
    <div
      className="
        relative w-full
        overflow-hidden
        rounded-[18px]
        border
        border-[var(--experience-image-border)]
        bg-[var(--experience-image-background)]
        shadow-[var(--experience-image-shadow)]
      "
    >
      <div
        className="
          relative
          aspect-[1.65/1]
          w-full
        "
      >
        <AnimatePresence
          initial={false}
          mode="popLayout"
          custom={direction}
        >
          <motion.div
            key={`${item.id}-${item.imageAlt}`}
            initial={{
              opacity: 0,
              y:
                direction === 1
                  ? imageDistance
                  : -imageDistance,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
              y:
                direction === 1
                  ? -imageDistance
                  : imageDistance,
            }}
            transition={{
              duration: 0.65,
              ease: [
                0.22,
                1,
                0.36,
                1,
              ],
            }}
            className="absolute inset-0"
          >
            <Image
              src={item.imageSrc}
              alt={item.imageAlt}
              fill
              sizes="(max-width: 1023px) 92vw, 52vw"
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
