"use client";

import {AnimatePresence,motion,useReducedMotion} from "framer-motion";
import {ArrowUp} from "lucide-react";
import {useMemo} from "react";
import {FaWhatsapp} from "react-icons/fa";
import { usePathname } from "next/navigation";

import {useSiteContent} from "@/hooks/useSiteContent";
import {useScrolled} from "@/hooks/useScrolled";

const WHATSAPP_PHONE = "237681704497";

export function FloatingWhatsApp() {
  const content = useSiteContent();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const showBackToTop = useScrolled(480);
  const whatsappUrl = useMemo(() => {
      const message = encodeURIComponent(
          content.whatsapp.generalMessage,
        );

      return `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;
    }, [
      content.whatsapp.generalMessage,
    ]);

  const label =content.whatsapp.buttonLabel;
  const backToTopLabel =content.accessibility.backToTop;

  const scrollToTop = (): void => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  if (
    pathname === "/simuler"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-5.5 right-5.5 z-100 flex flex-col items-center gap-3 sm:bottom-7 sm:right-8.5">
      <AnimatePresence initial={false}>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            type="button"
            aria-label={backToTopLabel}
            title={backToTopLabel}
            onClick={scrollToTop}
            initial={shouldReduceMotion ? false : {opacity: 0,y: 10,scale: 0.9,}}
            animate={{opacity: 1,y: 0,scale: 1,}}
            exit={shouldReduceMotion ? undefined : {opacity: 0,y: 8,scale: 0.92,}}
            whileHover={shouldReduceMotion ? undefined : {y: -2,scale: 1.04,}}
            whileTap={shouldReduceMotion ? undefined : {scale: 0.94,}}
            transition={{duration: shouldReduceMotion ? 0 : 0.28,ease: [0.22, 1, 0.36, 1],}}
            className="flex size-12 items-center justify-center rounded-full border border-brand/25 bg-surface/90 text-brand shadow-floating backdrop-blur-md transition-colors duration-300 hover:border-brand/45 hover:bg-brand hover:text-brand-contrast focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-3 sm:size-13"
          >
            <ArrowUp aria-hidden="true" className="size-5" strokeWidth={2.2}/>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="relative">
        {!shouldReduceMotion && (
          <motion.span aria-hidden="true" className=" pointer-events-none absolute inset-0 rounded-full border-2 border-whatsapp/50 "
            animate={{scale: [1, 1.55],opacity: [0.65, 0],}}
            transition={{duration: 1.8,ease: "easeOut",repeat: Infinity,}}
          />
        )}

        <motion.a
          href={whatsappUrl} target="_blank" rel="noreferrer" aria-label={label} title={label} whileHover={shouldReduceMotion? undefined : { y: -4, scale: 1.05, }}
          whileTap={ shouldReduceMotion? undefined: {scale: 0.94,}}
          className=" relative flex size-14 items-center justify-center rounded-full border border-white/30 bg-whatsapp text-white shadow-floating transition-colors duration-500 hover:bg-whatsapp-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-3 sm:size-14.5"
          transition={{type: "spring",stiffness: 150,damping: 18,mass: 0.85,}}
        >
          <FaWhatsapp aria-hidden="true" className="size-7" />
        </motion.a>
      </div>
    </div>
  );
}
