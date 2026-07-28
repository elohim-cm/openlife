"use client";

import {AnimatePresence,motion,useReducedMotion} from "framer-motion";
import {FaGlobeAfrica,} from "react-icons/fa";
import {useLocale} from "@/hooks/useLocale";
import {useSiteContent} from "@/hooks/useSiteContent";
import {cn} from "@/utils/cn";

type LanguageToggleProps = {className?: string;};

export function LanguageToggle({className,}: LanguageToggleProps) {
  const {locale,toggleLocale} = useLocale();
  const content =useSiteContent();
  const shouldReduceMotion =useReducedMotion();

  return (
    <motion.button type="button" onClick={() => { void toggleLocale();}}
      aria-label={ content.language.switchTo}
      title={content.language.switchTo}
      whileHover={shouldReduceMotion? undefined: {scale: 1.04,}}
      whileTap={shouldReduceMotion? undefined: {scale: 0.95,}}
      className={cn(`group relative flex h-9 min-w-14.5 shrink-0 items-center justify-center gap-1.25 overflow-hidden rounded-full border border-border bg-surface/80 px-2 text-icon transition-[background-color,border-color,color] duration-300 hover:border-border-brand hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface `,className,)}
      transition={{
              type: "spring",
              stiffness: 150,
              damping: 18,
              mass: 0.85,
            }}
    >
      <FaGlobeAfrica aria-hidden="true" className=" size-3.5 transition-transform duration-500 group-hover:rotate-18" />
      <span className=" relative block h-4.25 w-5.5 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={locale} initial={ shouldReduceMotion ? false : { opacity: 0, y: 10, }}
            animate={{opacity: 1,y: 0,}}
            exit={ shouldReduceMotion ? undefined : { opacity: 0, y: -10, }}
            transition={{duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut",}}
            className="absolute inset-0 flex items-center justify-center text-[12px] font-bold leading-none "            
          >
            {locale.toUpperCase()}
          </motion.span>
        </AnimatePresence>
      </span>
    </motion.button>
  );
}