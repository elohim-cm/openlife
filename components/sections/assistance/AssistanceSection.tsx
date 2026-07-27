"use client";

import {motion,useReducedMotion,} from "framer-motion";

import { AssistanceCard } from "./AssistanceCard";
import {ASSISTANCE_CONTACTS,} from "./assistance.data";
import { BusinessCard } from "./BusinessCard";

export function AssistanceSection() {
  const shouldReduceMotion = useReducedMotion();
  const reduceMotion = Boolean(shouldReduceMotion,);

  return (
    <section id="assistance" aria-labelledby="assistance-title"
      className="
        relative overflow-hidden
        border-b border-brand
        bg-background
      "
    >
      <div aria-hidden="true"
        className="
          pointer-events-none
          absolute left-1/2 top-[180px]
          size-[620px]
          -translate-x-1/2
          rounded-full
          bg-brand-soft/30
          blur-[140px]
        "
      />

      <div
        className="
          relative z-10
          mx-auto w-full
          max-w-[1120px]
          px-5 pb-[70px]
          pt-[72px]
          sm:px-8
          sm:pb-[90px]
          sm:pt-[85px]
          lg:px-10
          lg:pb-[75px]
          lg:pt-[95px]
        "
      >
        <motion.header
          initial={reduceMotion? false: {opacity: 0,y: 22,}}
          whileInView={{opacity: 1,y: 0,}}
          viewport={{once: true,amount: 0.6,}}
          transition={{duration: reduceMotion? 0: 0.6,ease: [0.22, 1, 0.36, 1],}}
          className="text-center"
        >
          <h2 id="assistance-title"
            className="
              text-[31px] font-bold
              leading-tight
              tracking-[-0.035em]
              text-heading
              sm:text-[38px]
              lg:text-[42px]
            "
          >Besoin d’Assistance ?</h2>

          <div aria-hidden="true"
            className="
              mt-[10px] flex
              items-center justify-center
              gap-[8px]
            "
          >
            <span className=" h-[6px] w-[37px] bg-brand "/>
            <span className=" h-[6px] w-[104px] bg-brand "/>
          </div>
        </motion.header>

        <div
          className="
            mt-[52px]
            grid grid-cols-1
            gap-[24px]
            sm:grid-cols-2
            lg:mt-[60px]
            lg:grid-cols-3
            lg:gap-[27px]
          "
        >
          {ASSISTANCE_CONTACTS.map((contact, index) => (<AssistanceCard key={contact.id} contact={contact} index={index} reduceMotion={reduceMotion}/>),)}
        </div>

        <div className="mt-[64px]">
          <BusinessCard reduceMotion={reduceMotion}/>
        </div>
      </div>
    </section>
  );
}