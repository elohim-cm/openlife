"use client";

import {motion,useReducedMotion,} from "framer-motion";
import {Accordion,} from "@/components/ui/accordion";

import { FaqItem } from "./FaqItem";
import { FAQ_ITEMS } from "./faq.data";

export function FaqSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="faq" aria-labelledby="faq-title" className="
        relative overflow-hidden
        border-t border-border-brand
        bg-background
      "
    >
      <div aria-hidden="true" className="
          pointer-events-none
          absolute left-1/2 top-[80px]
          size-[480px]
          -translate-x-1/2
          rounded-full
          bg-brand-soft/45
          blur-[120px]
        "
      />

      <div
        className="
          relative z-10
          mx-auto w-full
          max-w-[1500px]
          px-5 pb-[80px]
          pt-[70px]
          sm:px-8
          sm:pb-[100px]
          sm:pt-[85px]
          lg:px-10
          lg:pb-[115px]
          lg:pt-[95px]
        "
      >
        <motion.header
          initial={shouldReduceMotion? false: {opacity: 0,y: 24,}}
          whileInView={{opacity: 1,y: 0,}}
          viewport={{once: true,amount: 0.6,}}
          transition={{duration: shouldReduceMotion? 0: 0.6,ease: [0.22, 1, 0.36, 1],}}
          className="text-center"
        >
          <h2 id="faq-title" className="
              text-[30px] font-bold
              leading-tight
              tracking-[-0.035em]
              text-heading
              sm:text-[36px]
              lg:text-[40px]
            "
          >Comprendre Open Life</h2>

          <div aria-hidden="true" className="
              mt-[9px] flex
              items-center justify-center
              gap-[8px]
            "
          >
            <span className="h-[6px] w-[36px] bg-brand"/>
            <span className="h-[6px] w-[104px] bg-brand"/>
          </div>

          <p className="
              mt-[17px]
              text-[14px]
              text-text-muted
              sm:text-[15px]
            "
          >Réponses à vos interrogations essentielles</p>
        </motion.header>

        <Accordion type="single" collapsible className="
            mx-auto mt-[48px]
            max-w-[1340px]
            space-y-[13px]
            sm:mt-[58px]
          "
        >{FAQ_ITEMS.map((item, index) => (
            <motion.div key={item.id} 
              initial={shouldReduceMotion? false: {opacity: 0,y: 20,}}
              whileInView={{opacity: 1,y: 0,}}
              viewport={{once: true,amount: 0.25,}}
              transition={{duration: shouldReduceMotion? 0: 0.45,delay: shouldReduceMotion? 0: index * 0.055,ease: [0.22, 1, 0.36, 1],}}
            >
              <FaqItem item={item} />
            </motion.div>
          ))}
        </Accordion>
      </div>
    </section>
  );
}