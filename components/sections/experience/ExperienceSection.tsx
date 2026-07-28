"use client";

import {AnimatePresence,motion,} from "framer-motion";
import Image from "next/image";
import {useMemo,} from "react";

import {useScrollStory,} from "@/hooks/useScrollStory";
import {useSiteContent,} from "@/hooks/useSiteContent";

import {EXPERIENCE_ASSETS,type ExperienceItem,} from "./experience.data";

export function ExperienceSection() {
  const content =useSiteContent();

  const experienceItems =useMemo<readonly ExperienceItem[]>(() => {
      return EXPERIENCE_ASSETS.map((asset,index,) => {
          const translatedItem =content.experience.items[index];

          return {
            id:asset.id,
            imageSrc:asset.imageSrc,
            title:translatedItem?.title ?? "",
            description:translatedItem?.description ?? "",
            imageAlt:translatedItem?.imageAlt ?? "",
          };
        },
      );
    }, [content.experience.items,]);

  const {sectionRef,activeIndex,direction,progress} = useScrollStory({stepsCount:experienceItems.length,});

  const activeItem =experienceItems[activeIndex];

  if (!activeItem) {
    return null;
  }

  return (
    <section ref={sectionRef} id="openlife-experience" aria-labelledby="openlife-experience-title" className=" relative bg-background "
      style={{height: `${experienceItems.length * 100}svh`, }}
    >
      <div className="
          sticky top-0
          flex h-[100svh]
          w-full flex-col
          overflow-hidden
          bg-background
        "
      >
        <div
          className="
            mx-auto flex h-full
            w-full max-w-[1450px]
            flex-col
            px-5 pb-8 pt-[28px]
            sm:px-8
            lg:px-10
            lg:pb-10
          "
        >
          <header className="shrink-0 text-center">
            <h2 id="openlife-experience-title" className="
                text-[25px] font-bold
                leading-tight
                tracking-[-0.025em]
                text-heading
                sm:text-[28px]
                lg:text-[31px]
              "
            >{content.experience.title}</h2>

            <div aria-hidden="true" className="
                mt-[9px]
                flex items-center
                justify-center
                gap-[8px]
              "
            >
              <span className=" h-[6px] w-[35px] bg-brand"/>
              <span className=" h-[6px] w-[100px] bg-brand "/>
            </div>
          </header>

          <div className="
              grid min-h-0
              flex-1 items-center
              gap-9 pt-10
              lg:grid-cols-[0.75fr_1.5fr]
              lg:gap-[92px]
              lg:pt-[60px]
            "
          >
            <div className="order-2 w-full lg:order-1 lg:pl-[10px]">
              <div
                className="
                  relative
                  min-h-[260px]
                  pl-[45px]
                  sm:pl-[52px]
                  lg:min-h-[310px]
                "
              >
                <ExperienceProgress progress={progress} stepsCount={experienceItems.length}/>

                <ExperienceText item={activeItem} direction={direction}/>
              </div>
            </div>

            <div className=" order-1 w-full lg:order-2">
              <ExperienceImage item={activeItem} direction={direction}/>
            </div>
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

function ExperienceText({
  item,
  direction,
}: AnimatedPartProps) {
  const textDistance = 72;

  return (
    <div
      className="
        relative
        min-h-[260px]
        overflow-hidden
        lg:min-h-[310px]
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
            duration: 0.72,
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
          "
        >
          <h3
            className="
              text-[27px]
              font-bold
              leading-[1.2]
              tracking-[-0.025em]
              text-heading-secondary
              sm:text-[30px]
              lg:text-[31px]
            "
          >
            {item.title}
          </h3>

          <p
            className="
              mt-[22px]
              max-w-[470px]
              text-[15px]
              leading-[1.65]
              text-text-muted
              sm:text-[16px]
              lg:text-[17px]
            "
          >{item.description}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

type ExperienceProgressProps = {progress: number;stepsCount: number;};
function ExperienceProgress({progress,stepsCount,}: ExperienceProgressProps) {
  const dotsCount =Math.max(stepsCount,1,);
  const activeDotIndex = Math.min(
      Math.round(
        progress *
          (dotsCount - 1),
      ),
      dotsCount - 1,
    );

  return (
    <div
      aria-hidden="true"
      className="
        absolute left-0 top-1/2
        z-20
        flex -translate-y-1/2
        flex-col items-center
        gap-[10px]
      "
    >
      {Array.from({
        length: dotsCount,
      }).map((_, index) => {
        const isActive = index === activeDotIndex;
        const isPassed = index < activeDotIndex;

        return (
          <span key={index} className={`
              block rounded-full
              transition-[width,height,background-color,box-shadow,opacity]
              duration-500
              ease-[cubic-bezier(0.22,1,0.36,1)]
              ${
                isActive
                  ? `
                    size-[15px]
                    bg-brand
                    opacity-100
                    shadow-[0_3px_10px_rgba(23,107,12,0.38)]
                  `
                  : isPassed
                    ? `
                      size-[8px]
                      bg-brand/55
                      opacity-90
                    `
                    : `
                      size-[8px]
                      bg-icon-muted
                      opacity-100
                    `
              }
            `}
          />
        );
      })}
    </div>
  );
}

function ExperienceImage({item,direction,}: AnimatedPartProps) {
  const imageDistance = 90;

  return (
    <div className="
        relative w-full
        overflow-hidden
        rounded-[11px]
        border border-border
        bg-surface-muted
        shadow-card
      "
    >
      <div className="
          relative
          aspect-[1.65/1]
          w-full
        "
      >
        <AnimatePresence initial={false} mode="popLayout" custom={direction}>
          <motion.div key={`${item.id}-${item.imageAlt}`} 
            initial={{opacity: 0,y:direction === 1? imageDistance: -imageDistance,}}
            animate={{opacity: 1,y: 0,}}
            exit={{opacity: 0,y:direction === 1? -imageDistance: imageDistance,}}
            transition={{duration: 0.65,ease: [0.22,1,0.36,1,],}}
            className="absolute inset-0"
          >
            <Image src={item.imageSrc} alt={item.imageAlt} fill sizes=" (max-width: 1023px) 92vw, 55vw "/>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}