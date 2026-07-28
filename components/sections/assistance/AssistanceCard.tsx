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
      className="group relative flex min-h-[360px] w-full flex-col items-center overflow-hidden rounded-[20px] border border-border bg-surface-elevated px-6 pb-8 pt-[37px] text-center shadow-card transition-[border-color,box-shadow] duration-300 hover:border-border-brand hover:shadow-card-hover sm:min-h-[380px] lg:min-h-[405px] "
    >
      <div aria-hidden="true" className=" pointer-events-none absolute left-1/2 top-0 size-[190px] -translate-x-1/2 -translate-y-[65%] rounded-full bg-brand-soft/65 blur-[45px] transition-transform duration-500 group-hover:scale-125"/>

      <div
        className="
          relative z-10
          flex size-[68px]
          items-center justify-center
          rounded-[17px]
          bg-surface-muted
          shadow-[inset_0_0_0_1px_var(--border)]
          transition-[transform,background-color]
          duration-300
          group-hover:-translate-y-1
          group-hover:bg-brand-soft
        "
      >
        <Icon aria-hidden="true" className={` size-[22px] ${contact.accentClassName} `}/>
      </div>

      <h3
        className="
          mt-[44px]
          text-[21px] font-bold
          leading-tight
          text-heading
          sm:text-[22px]
        "
      >{contact.title} </h3>

      <p
        className="
          mt-[27px]
          max-w-[270px]
          text-[14px]
          leading-[1.55]
          text-text-muted
          sm:text-[15px]
        "
      >{contact.description}</p>

      <a href={contact.href} aria-label={contact.ariaLabel} target={ isExternalLink ? "_blank" : undefined } rel={ isExternalLink? "noreferrer" : undefined }
        className="
          mt-[20px]
          inline-flex min-h-10
          max-w-full items-center
          justify-center rounded-lg
          px-2
          text-[15px] font-bold
          leading-[1.35]
          text-heading-secondary
          transition-colors
          duration-500
          hover:text-brand
          focus-visible:outline-none
          focus-visible:ring-2
          focus-visible:ring-focus
          focus-visible:ring-offset-2
          sm:text-[16px]
        "
      >
        <span className="break-all">{contact.value} </span>
      </a>

      <p
        className="
          mt-[13px]
          text-[11px] font-bold
          uppercase
          tracking-[0.065em]
          text-success
          sm:text-[12px]
        "
      >{contact.status} </p>
    </motion.article>
  );
}