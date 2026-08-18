"use client";

import {motion,useReducedMotion} from "framer-motion";
import {useMemo} from "react";
import {FaWhatsapp} from "react-icons/fa";
import { usePathname } from "next/navigation";

import {useSiteContent} from "@/hooks/useSiteContent";

const WHATSAPP_PHONE = "237658994705";

export function FloatingWhatsApp() {
  const content = useSiteContent();
  const pathname = usePathname();
  const shouldReduceMotion = useReducedMotion();
  const whatsappUrl = useMemo(() => {
      const message = encodeURIComponent(
          content.whatsapp.generalMessage,
        );

      return `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;
    }, [
      content.whatsapp.generalMessage,
    ]);

  const label =content.whatsapp.buttonLabel;

  if (
    pathname === "/simuler"
  ) {
    return null;
  }

  return (
    <div className="fixed bottom-5.5 right-5.5 z-100 sm:bottom-7 sm:right-8.5">
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
        transition={{
          type: "spring",
          stiffness: 150,
          damping: 18,
          mass: 0.85,
        }}
      >
        <FaWhatsapp aria-hidden="true" className="size-7" />
      </motion.a>
    </div>
  );
}