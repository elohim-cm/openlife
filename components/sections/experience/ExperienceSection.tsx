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

  const {sectionRef,activeIndex,direction,} = useScrollStory({stepsCount:experienceItems.length,});

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
            <div className="
                order-2 w-full
                lg:order-1
                lg:pl-[10px]
              "
            >
              <div className="
                  relative
                  min-h-[260px]
                  lg:min-h-[310px]
                "
              >
                <ExperienceText 
                  item={ activeItem} 
                  direction={direction}
                />
              </div>
            </div>

            <div className=" order-1 w-full lg:order-2">
              <ExperienceImage 
                item={activeItem}
                direction={direction}
              />
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

function ExperienceText({item,direction,}: AnimatedPartProps) {
  const textDistance = 70;

  return (
    <AnimatePresence initial={false} mode="wait" custom={direction}>
      <motion.div key={`${item.id}-${item.title}`} custom={direction}
        initial={{opacity: 0,y:direction === 1? textDistance: -textDistance,}}
        animate={{opacity: 1,y: 0,}}
        exit={{opacity: 0,y:direction === 1? -textDistance: textDistance,}}
        transition={{duration: 0.55,ease: [0.22,1,0.36,1,],}}
        className="
          absolute inset-0
          flex flex-col
          justify-center
        "
      >
        <h3 className="
            text-[27px]
            font-bold
            leading-[1.2]
            tracking-[-0.025em]
            text-heading-secondary
            sm:text-[30px]
          "
        >{item.title}</h3>

        <div className=" mt-[17px] flex items-start gap-[20px] ">
          <div aria-hidden="true" className=" flex w-[15px] shrink-0 flex-col items-center pt-[4px] " >
            <span className="
                size-[11px]
                rounded-full
                bg-brand
                shadow-card
              "
            />

            {Array.from({length: 4,}).map((_, index) => (
                <span key={index} className="mt-[7px] size-[7px] rounded-full  bg-icon-muted " />
              ),
            )}
          </div>

          <p className="
              max-w-[400px]
              text-[15px]
              leading-[1.55]
              text-text-muted
              sm:text-[16px]
            "
          >{item.description}</p>
        </div>
      </motion.div>
    </AnimatePresence>
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
            <Image src={item.imageSrc} alt={item.imageAlt} fill sizes=" (max-width: 1023px) 92vw, 55vw " className="object-contain"/>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}