import React from "react";
import Image from "next/image";
import {logo, logo_white} from "@/utils/assets/assets";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {FaArrowLeft, FaGlobeAfrica, FaMoon, FaSun} from "react-icons/fa";
import {useTranslation} from "react-i18next";
import {useThemeMode} from "@/contexts/themeModeContext";

const SousHeader = ({onBack, children}) => {
  const {t, i18n} = useTranslation();
  const {mode, toggleMode} = useThemeMode();
  const reduceMotion = Boolean(useReducedMotion());
  const language = (i18n.resolvedLanguage || i18n.language || "fr").split("-")[0].toLowerCase();
  const isFrench = language === "fr";

  const toggleLanguage = async () => {
    const nextLanguage = isFrench ? "en" : "fr";
    await i18n.changeLanguage(nextLanguage);
    localStorage.setItem("i18nextLng", nextLanguage);
  };

  return (
    <motion.header
      className="sous-header"
      initial={reduceMotion ? false : {opacity: 0}}
      animate={{opacity: 1}}
      transition={{duration: reduceMotion ? 0 : 0.65, ease: [0.22, 1, 0.36, 1]}}
    >
      <div className="sous-header-inner">
        <button type="button" className="sous-logo-button" onClick={() => { window.location.href = "/"; }} aria-label={t("publicHeader.homeLabel")}>
          <Image src={mode === "dark" ? logo_white : logo} alt={t("publicHeader.logoAlt")} width="145" height="68" priority />
        </button>

        <div className="sous-header-controls">
          <motion.button
            type="button"
            className="sous-language-toggle"
            onClick={() => { void toggleLanguage(); }}
            aria-label={isFrench ? t("publicHeader.switchToEnglish") : t("publicHeader.switchToFrench")}
            whileHover={reduceMotion ? undefined : {scale: 1.04}}
            whileTap={reduceMotion ? undefined : {scale: 0.95}}
            transition={{type: "spring", stiffness: 150, damping: 18, mass: 0.85}}
          >
            <FaGlobeAfrica className="sous-language-icon" aria-hidden="true" />
            <span className="sous-language-code">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span key={language} initial={reduceMotion ? false : {opacity: 0, y: 10}} animate={{opacity: 1, y: 0}} exit={reduceMotion ? undefined : {opacity: 0, y: -10}} transition={{duration: reduceMotion ? 0 : 0.2, ease: "easeOut"}}>
                  {language.toUpperCase()}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>

          <button type="button" className="sous-theme-toggle" onClick={toggleMode} aria-label={mode === "light" ? t("publicHeader.darkTheme") : t("publicHeader.lightTheme")} aria-pressed={mode === "dark"}>
            <span className={`sous-theme-icon sous-theme-moon ${mode === "dark" ? "is-hidden" : "is-visible"}`}><FaMoon aria-hidden="true" /></span>
            <span className={`sous-theme-icon sous-theme-sun ${mode === "dark" ? "is-visible" : "is-hidden"}`}><FaSun aria-hidden="true" /></span>
          </button>

          <button type="button" className="sous-back-button" onClick={onBack}>
            <FaArrowLeft aria-hidden="true" />
            <span>{children || t("back")}</span>
          </button>
        </div>
      </div>
    </motion.header>
  );
};

export default SousHeader;
