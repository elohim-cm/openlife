"use client";

import { motion } from "framer-motion";

import type {AssistanceContact,} from "./assistance.data";

type AssistanceCardProps = {
  contact: AssistanceContact;
  index: number;
  reduceMotion: boolean;
};

export function AssistanceCard({contact,index,reduceMotion,}: AssistanceCardProps) {
  const Icon = contact.icon;
  const isExternalLink = contact.href.startsWith("http");

  return (
    <motion.article initial={reduceMotion? false: {opacity: 0,y: 32,}}
      whileInView={{opacity: 1,y: 0,}}
      viewport={{once: true,amount: 0.3,}}
      transition={{duration: reduceMotion? 0: 0.55,delay: reduceMotion? 0: index * 0.1,ease: [0.22, 1, 0.36, 1],}}
      whileHover={reduceMotion? undefined: {y: -7,}}
      className="group relative mx-auto flex w-full max-w-[330px] flex-col items-center overflow-hidden rounded-[16px] border border-border bg-white/65 dark:bg-black/65 px-4 pb-5 pt-6 text-center shadow-card transition-[border-color,box-shadow] duration-300 hover:border-border-brand hover:shadow-card-hover sm:min-h-95 sm:max-w-none sm:rounded-[20px] sm:px-6 sm:pb-8 sm:pt-9.25 lg:min-h-101.25 "
    >
      <div aria-hidden="true" className=" pointer-events-none absolute left-1/2 top-0 size-47.5 -translate-x-1/2 -translate-y-65% rounded-full bg-brand-soft/65 blur-[45px] transition-transform duration-500 group-hover:scale-125"/>

      <div
        className="
          relative z-10
          flex size-14
          items-center justify-center
          rounded-[14px]
          bg-surface-muted
          shadow-[inset_0_0_0_1px_var(--border)]
          transition-[transform,background-color]
          duration-300
          group-hover:-translate-y-1
          group-hover:bg-brand-soft
          sm:size-17
          sm:rounded-[17px]
        "
      >
        <Icon aria-hidden="true" className={` size-7 sm:size-8 ${contact.accentClassName} `}/>
      </div>

      <h3
        className="
          mt-4
          text-[18px] font-bold
          leading-tight
          text-heading
          sm:mt-5
          sm:text-[22px]
        "
      >{contact.title} </h3>

      <p
        className="
          mt-3
          max-w-67.5
          text-[13px]
          leading-[1.5]
          text-text-muted
          sm:mt-5
          sm:text-[15px]
        "
      >{contact.description}</p>

      <a href={contact.href} aria-label={contact.ariaLabel} target={ isExternalLink ? "_blank" : undefined } rel={ isExternalLink? "noreferrer" : undefined }
        className="
          mt-4
          inline-flex
          max-w-full items-center
          justify-center rounded-lg
          px-2
          text-[14px] font-bold
          leading-[1.35]
          text-heading-secondary
          transition-colors
          duration-500
          hover:text-brand
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-focus
          focus-visible:ring-offset-2
          sm:mt-5
          sm:text-[16px]
        "
      >
        <span className="break-all">{contact.value} </span>
      </a>

      <p
        className="
          mt-2.5
          text-[10px] font-bold
          uppercase
          tracking-[0.065em]
          text-success
          sm:mt-3.25
          sm:text-[12px]
        "
      >{contact.status} </p>
    </motion.article>
  );
}
