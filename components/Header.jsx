"use client";

import { useEffect, useRef, useState } from "react";
import { Adb } from "@mui/icons-material";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { FaApple, FaGift, FaGlobeAfrica, FaHeadset, FaMobileAlt, FaMoon, FaQuestionCircle, FaRoute, FaSun, FaUser } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useAppContext } from "@/contexts/appContext";
import { useThemeMode } from "@/contexts/themeModeContext";
import Routes from "@/utils/routes";
import { logo } from "@/utils/assets/assets";

const ANDROID_URL = "https://play.google.com/store/apps/details?id=com.acamvie.open_life";
const IOS_URL = "https://apps.apple.com/cm/app/open-life/id1628082679";
const mobileMenuVariants = {
  hidden: { y: -18, scale: 0.98 },
  visible: {
    y: 0,
    scale: 1,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.055, delayChildren: 0.04 },
  },
  exit: {
    y: -12,
    scale: 0.985,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1], staggerChildren: 0.035, staggerDirection: -1 },
  },
};
const mobileLinkVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -6, transition: { duration: 0.14, ease: "easeIn" } },
};

export default function Header() {
  const context = useAppContext();
  const { mode, toggleMode } = useThemeMode();
  const { t, i18n } = useTranslation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileMenuToggleRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();

  const sectionLinks = [
    { href: "#openlife-benefits", label: t("publicHeader.sections.benefits"), icon: FaGift },
    { href: "#openlife-experience", label: t("publicHeader.sections.experience"), icon: FaRoute },
    { href: "#app-download-section", label: t("publicHeader.sections.mobileApp"), icon: FaMobileAlt },
    { href: "#faq-section", label: t("publicHeader.sections.faq"), icon: FaQuestionCircle },
    { href: "#assistance", label: t("publicHeader.sections.assistance"), icon: FaHeadset },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const closeOnEscape = event => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };
    const closeOnOutsidePointer = event => {
      const clickedInsideHeader = headerRef.current?.contains(event.target);
      const clickedInsideMenu = mobileMenuRef.current?.contains(event.target);
      const clickedMenuToggle = mobileMenuToggleRef.current?.contains(event.target);
      if (!clickedInsideHeader && !clickedInsideMenu && !clickedMenuToggle) setMobileMenuOpen(false);
    };

    window.addEventListener("keydown", closeOnEscape);
    document.addEventListener("pointerdown", closeOnOutsidePointer);

    return () => {
      window.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener("pointerdown", closeOnOutsidePointer);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const desktopQuery = window.matchMedia("(min-width: 1280px)");
    const closeMenuOnDesktop = event => {
      if (event.matches) setMobileMenuOpen(false);
    };

    desktopQuery.addEventListener("change", closeMenuOnDesktop);
    return () => desktopQuery.removeEventListener("change", closeMenuOnDesktop);
  }, []);

  const language = (i18n.resolvedLanguage || i18n.language || "fr").split("-")[0].toLowerCase();
  const isFrench = language === "fr";
  const languageToggleLabel = isFrench ? t("publicHeader.switchToEnglish") : t("publicHeader.switchToFrench");
  const themeToggleLabel = mode === "light" ? t("publicHeader.darkTheme") : t("publicHeader.lightTheme");

  const toggleLanguage = async () => {
    const nextLanguage = isFrench ? "en" : "fr";
    await i18n.changeLanguage(nextLanguage);
    localStorage.setItem("i18nextLng", nextLanguage);
  };

  const scrollToSection = (event, href) => {
    event.preventDefault();
    const section = document.querySelector(href);
    if (!section) return;

    const headerHeight = document.querySelector(".hero-appbar")?.offsetHeight ?? 80;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top - headerHeight - 16;

    setMobileMenuOpen(false);
    window.history.pushState(null, "", href);
    window.requestAnimationFrame(() => {
      window.scrollTo({
        top: Math.max(0, sectionTop),
        behavior: shouldReduceMotion ? "auto" : "smooth",
      });
    });
  };

  return (
    <>
      <header ref={headerRef} className={`hero-appbar ${scrolled ? "scrolled" : "transparent"}`}>
        <div className="header-inner">
        <Link href="/" className="header-logo-link" aria-label={t("publicHeader.homeLabel")}>
          <Image src={logo} alt={t("publicHeader.logoAlt")} className="logo-animate header-logo" priority />
        </Link>

        <nav className="header-section-nav" aria-label={t("publicHeader.sectionsLabel")}>
          {sectionLinks.map(item => (
            <Link key={item.href} href={item.href} className="header-section-link">
              {item.label}
            </Link>
          ))}
        </nav>

        <nav className="__right-section-header" aria-label={t("publicHeader.navigationLabel")}>
          <Link href={ANDROID_URL} target="_blank" rel="noopener noreferrer" className="header-app-icon header-android-icon" aria-label={t("publicHeader.androidLabel")} title={t("publicHeader.androidTitle")}>
            <Adb className="header-android-svg" />
          </Link>
          <Link href={IOS_URL} target="_blank" rel="noopener noreferrer" className="header-app-icon header-ios-icon" aria-label={t("publicHeader.appleLabel")} title={t("publicHeader.appleTitle")}>
            <FaApple />
          </Link>

          <span className="header-separator" aria-hidden="true" />

          <Link href={Routes.LOGIN} className="login-link login-link-animate" onClick={() => context.togglePageLoading(true)} aria-label={t("publicHeader.account")}>
            <span>{t("publicHeader.account")}</span>
            <FaUser className="header-user-icon" />
          </Link>

          <motion.button
            type="button"
            className="header-language-toggle"
            onClick={() => { void toggleLanguage(); }}
            aria-label={languageToggleLabel}
            title={languageToggleLabel}
            whileHover={shouldReduceMotion ? undefined : { scale: 1.04 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.95 }}
            transition={{ type: "spring", stiffness: 150, damping: 18, mass: 0.85 }}
          >
            <FaGlobeAfrica className="header-language-icon" aria-hidden="true" />
            <span className="header-language-code">
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={language}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                  transition={{ duration: shouldReduceMotion ? 0 : 0.2, ease: "easeOut" }}
                >
                  {language.toUpperCase()}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.button>

          <button
            type="button"
            className="header-theme-toggle"
            onClick={toggleMode}
            aria-label={themeToggleLabel}
            title={themeToggleLabel}
            aria-pressed={mode === "dark"}
            data-theme-transition
          >
            <span className={`header-theme-icon-layer header-moon-layer ${mode === "dark" ? "is-hidden" : "is-visible"}`}>
              <FaMoon className="header-moon-icon" aria-hidden="true" />
            </span>
            <span className={`header-theme-icon-layer header-sun-layer ${mode === "dark" ? "is-visible" : "is-hidden"}`}>
              <FaSun className="header-sun-icon" aria-hidden="true" />
            </span>
          </button>

          <button
            ref={mobileMenuToggleRef}
            type="button"
            className={`header-menu-toggle ${mobileMenuOpen ? "is-open" : ""}`}
            onClick={() => setMobileMenuOpen(open => !open)}
            aria-label={mobileMenuOpen ? t("publicHeader.closeMenu") : t("publicHeader.openMenu")}
            aria-expanded={mobileMenuOpen}
            aria-controls="header-mobile-menu">
            <span />
            <span />
            <span />
          </button>
        </nav>
        </div>
      </header>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.nav
            ref={mobileMenuRef}
            id="header-mobile-menu"
            className="header-mobile-menu"
            aria-label={t("publicHeader.sectionsLabel")}
            variants={mobileMenuVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
            exit={shouldReduceMotion ? undefined : "exit"}>
            <motion.div className="header-mobile-links">
              {sectionLinks.map(item => {
                const SectionIcon = item.icon;
                return (
                  <motion.div key={item.href} variants={mobileLinkVariants}>
                    <Link href={item.href} onClick={event => scrollToSection(event, item.href)}>
                      <SectionIcon aria-hidden="true" />
                      <span>{item.label}</span>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
            <motion.div variants={mobileLinkVariants}>
              <Link
                href={Routes.SIMULER}
                className="header-mobile-simulate"
                onClick={() => {
                  setMobileMenuOpen(false);
                  context.togglePageLoading(true);
                }}>
                {t("publicHeader.simulate")}
              </Link>
            </motion.div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
