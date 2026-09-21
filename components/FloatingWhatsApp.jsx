"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowUpward, WhatsApp } from "@mui/icons-material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useTranslation } from "react-i18next";

const WHATSAPP_PHONE = "237681704497";

export default function FloatingWhatsApp() {
  const { t } = useTranslation();
  const shouldReduceMotion = useReducedMotion();
  const [showBackToTop, setShowBackToTop] = useState(false);
  const whatsappMessage = t("whatsapp.generalMessage");

  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 480);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const whatsappUrl = useMemo(() => {
    const message = encodeURIComponent(whatsappMessage);
    return `https://wa.me/${WHATSAPP_PHONE}?text=${message}`;
  }, [whatsappMessage]);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: shouldReduceMotion ? "auto" : "smooth",
    });
  };

  return (
    <div className="floating-whatsapp">
      <AnimatePresence initial={false}>
        {showBackToTop && (
          <motion.button
            key="back-to-top"
            type="button"
            className="floating-back-to-top"
            aria-label={t("accessibility.backToTop")}
            title={t("accessibility.backToTop")}
            onClick={scrollToTop}
            initial={shouldReduceMotion ? false : { opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={shouldReduceMotion ? undefined : { opacity: 0, y: 8, scale: 0.92 }}
            whileHover={shouldReduceMotion ? undefined : { y: -2, scale: 1.04 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
            transition={{ duration: shouldReduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <ArrowUpward aria-hidden="true" />
          </motion.button>
        )}
      </AnimatePresence>

      <div className="floating-whatsapp-button-wrapper">
        <span className="floating-whatsapp-pulse" aria-hidden="true" />
        <span className="floating-whatsapp-tooltip" role="tooltip">
          {t("whatsapp.buttonLabel")}
        </span>

        <motion.a
          className="floating-whatsapp-button"
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={t("whatsapp.buttonLabel")}
          whileHover={shouldReduceMotion ? undefined : { y: -4, scale: 1.05 }}
          whileTap={shouldReduceMotion ? undefined : { scale: 0.94 }}
          transition={{ type: "spring", stiffness: 150, damping: 18, mass: 0.85 }}
        >
          <WhatsApp aria-hidden="true" />
        </motion.a>
      </div>
    </div>
  );
}
