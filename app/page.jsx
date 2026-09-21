"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { Box, Button, Container, Typography, Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { useRouter } from "next/navigation";
import { getToken } from "@/utils";
import Routes from "@/utils/routes";
import { useTranslation } from "react-i18next";
import { logo } from "@/utils/assets/assets";
import { useThemeMode } from "@/contexts/themeModeContext";
import { motion, useInView, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion';
import { FaArrowRight, FaBullseye, FaChartLine, FaCheck, FaEnvelope, FaPhoneAlt, FaShieldAlt, FaUsers, FaWhatsapp } from "react-icons/fa";
import { LuCheck, LuLock, LuShieldCheck, LuStar, LuUsers2 } from "react-icons/lu";
import '@/styles/home.css'
import { Adb, Apple, Person2, Shield, TrendingUp, AccountBalanceWallet, AccessTime, Dashboard, Subscriptions, Assessment, CollectionsBookmark, Redeem } from "@mui/icons-material";
import Link from "next/link";
import Image from "next/image";
import { useTheme } from "@mui/material/styles";
import { useAppContext } from "@/contexts/appContext";
import SEOHead from "@/components/SEOHead";
import { generateStructuredData, generateBreadcrumbList } from "@/lib/structuredData";
import openlifeGreen from "@/public/images/openlife-green.png"
import logoWhite from "@/public/images/logo_blanc.png"
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";

const HERO_TRUST_COUNT_DURATION = 1600;

const getAnimatedTrustTitle = (id, title, progress) => {
  if (id === "savers") {
    const value = Math.round(50000 * progress);
    const separator = title.includes(",") ? "," : " ";
    const formattedValue = String(value).replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    return title.replace(/50[\s,]000/, formattedValue);
  }

  if (id === "rating") {
    const decimalSeparator = title.includes("4,8") ? "," : ".";
    const value = (4.8 * progress).toFixed(1).replace(".", decimalSeparator);

    return title.replace(/4[.,]8/, value);
  }

  return title;
};

const BenefitIcon = ({ type }) => {
  const commonProps = {
    "aria-hidden": true,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  if (type === "daily-contribution") {
    return <svg {...commonProps}><path d="M13.744 17.736a6 6 0 1 1-7.48-7.48" /><path d="M15 6h1v4" /><path d="m6.134 14.768.866-.5 2 3.464" /><circle cx="16" cy="8" r="6" /></svg>;
  }
  if (type === "no-fees") {
    return <svg {...commonProps}><path d="M3 11h3.75a2 2 0 0 1 1.6.8l.45.6a4 4 0 0 0 6.4 0l.45-.6a2 2 0 0 1 1.6-.8H21" /><path d="M3 7h18" /><rect x="3" y="3" width="18" height="18" rx="2" /></svg>;
  }
  if (type === "withdrawal-period") {
    return <svg {...commonProps}><path d="M16 14v2.2l1.6 1" /><path d="M16 2v4" /><path d="M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" /><path d="M3 10h5" /><path d="M8 2v4" /><circle cx="16" cy="16" r="6" /></svg>;
  }
  return <svg {...commonProps}><circle cx="12" cy="12" r="10" /><path d="m15 9-6 6" /><path d="M9 9h.01" /><path d="M15 15h.01" /></svg>;
};

const Home = props => {
  const { t, i18n } = useTranslation();
  const reduceMotion = Boolean(useReducedMotion());
  const typingInterludeRef = useRef(null);
  const router = useRouter();
  const theme = useTheme();
  const [openFaqId, setOpenFaqId] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activePhone, setActivePhone] = useState(0);
  const [activeTrackerIndex, setActiveTrackerIndex] = useState(0);
  const trackerSectionRef = useRef(null);
  const context = useAppContext();
  const { mode } = useThemeMode();

  const phoneImages = [
    { id: 1, name: 'login' },
    { id: 2, name: 'dashboard' },
    { id: 3, name: 'simulation' },
    { id: 4, name: 'collection' },
    { id: 5, name: 'redemption' }
  ];

  const currentLang = (i18n.resolvedLanguage || i18n.language || 'fr').split('-')[0];
  const seoTitle = currentLang === 'fr'
    ? "Open Life | Épargne journalière digitale au Cameroun"
    : "Open Life | Digital daily savings in Cameroon";
  const seoDescription = currentLang === 'fr'
    ? "Épargnez dès 200 FCFA par jour avec Open Life, la solution digitale d’ACAM Vie pour constituer votre capital simplement depuis votre téléphone."
    : "Save from 200 FCFA per day with Open Life, ACAM Vie’s digital solution for building your savings easily from your phone.";
  const seoKeywords = currentLang === 'fr'
    ? "Open Life, ACAM Vie, épargne journalière, épargne digitale, assurance vie, simulation épargne, Cameroun, 200 FCFA"
    : "Open Life, ACAM Vie, daily savings, digital savings, life insurance, savings simulation, Cameroon, 200 FCFA";

  const organizationData = generateStructuredData('organization', {}, currentLang);
  const websiteData = generateStructuredData('website', {}, currentLang);
  const webappData = generateStructuredData('webapp', {}, currentLang);
  const serviceData = generateStructuredData('service', {}, currentLang);
  const breadcrumbData = generateBreadcrumbList([{ name: currentLang === 'fr' ? 'Accueil' : 'Home', url: '/' }], currentLang);

  const currentLogo = mode === 'light' ? logo : logoWhite;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActivePhone((prev) => (prev + 1) % phoneImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [phoneImages.length, isHovered]);

  const trackerFeatures = [
    {
      icon: <Assessment />,
      image: '/images/openlife_trakers/simulation.png'
    },
    {
      icon: <Subscriptions />,
      image: '/images/openlife_trakers/subscription.png'
    },
    {
      icon: <Dashboard />,
      image: '/images/openlife_trakers/dashboard.png'
    },
    {
      icon: <CollectionsBookmark />,
      image: '/images/openlife_trakers/collection.png'
    },
    {
      icon: <Redeem />,
      image: '/images/openlife_trakers/redemption.png'
    }
  ].map((feature, index) => ({
    ...feature,
    id: t(`experience.items.${index}.id`),
    title: t(`experience.items.${index}.title`),
    description: t(`experience.items.${index}.description`),
    imageAlt: t(`experience.items.${index}.imageAlt`),
  }));
  const activeTrackerFeature = trackerFeatures[activeTrackerIndex] || trackerFeatures[0];

  const scrollToTrackerStep = (index) => {
    const section = trackerSectionRef.current;
    if (!section) return;
    const sectionTop = window.scrollY + section.getBoundingClientRect().top;
    const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 0);
    window.scrollTo({
      top: sectionTop + (scrollableDistance * index) / (trackerFeatures.length - 1),
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  };

  useEffect(() => {
    sessionStorage.removeItem("access-selection-reloaded");
    let frameId;
    const updateTrackerStep = () => {
      cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const section = trackerSectionRef.current;
        if (!section) return;
        const sectionTop = window.scrollY + section.getBoundingClientRect().top;
        const scrollableDistance = Math.max(section.offsetHeight - window.innerHeight, 1);
        const progress = Math.min(1, Math.max(0, (window.scrollY - sectionTop) / scrollableDistance));
        setActiveTrackerIndex(Math.min(4, Math.round(progress * 4)));
      });
    };
    updateTrackerStep();
    window.addEventListener('scroll', updateTrackerStep, { passive: true });
    window.addEventListener('resize', updateTrackerStep);
    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('scroll', updateTrackerStep);
      window.removeEventListener('resize', updateTrackerStep);
    };
  }, []);

  const { scrollYProgress: typingInterludeScrollProgress } = useScroll({
    target: typingInterludeRef,
    offset: ["start start", "end end"],
  });
  const typingInterludeSmoothProgress = useSpring(typingInterludeScrollProgress, {
    stiffness: 95,
    damping: 28,
    mass: 0.28,
  });
  const typingInterludeProgress = useTransform(typingInterludeSmoothProgress, [0, 0.78], [0, 1], { clamp: true });
  const typingFirstFontSize = useTransform(typingInterludeProgress, [0, 1], ["clamp(1.7rem, 3.6vw, 3.625rem)", "clamp(0.95rem, 1.25vw, 1.125rem)"]);
  const typingFirstLineHeight = useTransform(typingInterludeProgress, [0, 1], [1.14, 1.45]);
  const typingFirstOpacity = useTransform(typingInterludeProgress, [0, 0.72, 1], [1, 0.9, 0.82]);
  const typingSecondFontSize = useTransform(typingInterludeProgress, [0, 1], ["clamp(0.95rem, 1.25vw, 1.125rem)", "clamp(1.7rem, 3.6vw, 3.625rem)"]);
  const typingSecondLineHeight = useTransform(typingInterludeProgress, [0, 1], [1.45, 1.14]);
  const typingSecondOpacity = useTransform(typingInterludeProgress, [0, 0.3, 1], [0.78, 1, 1]);
  const typingTomorrowActiveOpacity = useTransform(typingInterludeProgress, [0, 0.42, 0.65], [0, 0, 1]);
  const typingTomorrowImageOpacity = useTransform(typingInterludeProgress, [0, 0.38, 0.68, 1], [0, 0, 1, 1]);
  const typingTodayCardOpacity = useTransform(typingInterludeProgress, [0, 0.42, 0.58], [1, 1, 0]);
  const typingTomorrowCardOpacity = useTransform(typingInterludeProgress, [0, 0.42, 0.58, 1], [0, 0, 1, 1]);

  const assistanceTranslations = t("assistance.contacts", { returnObjects: true });
  const translatedContacts = Array.isArray(assistanceTranslations) ? assistanceTranslations : [];
  const assistanceDefinitions = [
    { id: "phone", icon: FaPhoneAlt, href: "tel:+237681704497" },
    { id: "whatsapp", icon: FaWhatsapp, href: `https://wa.me/237681704497?text=${encodeURIComponent(t("whatsapp.generalMessage"))}` },
    { id: "email", icon: FaEnvelope, href: "mailto:support.openlife@acamvie.com" },
  ];
  const assistanceContacts = assistanceDefinitions.map((definition, contactIndex) => ({
    ...definition,
    ...(translatedContacts[contactIndex] || {}),
  }));
  const businessWhatsappUrl = `https://wa.me/237681704497?text=${encodeURIComponent(t("whatsapp.businessMessage"))}`;
  const homeFaqTranslations = t("homeFaq.items", { returnObjects: true });
  const homeFaqItems = Array.isArray(homeFaqTranslations) ? homeFaqTranslations : [];
  const faqData = generateStructuredData('faq', homeFaqItems, currentLang);
  const homeStructuredData = [organizationData, websiteData, webappData, serviceData, faqData, breadcrumbData];
  const homeStructuredGraph = {
    "@context": "https://schema.org",
    "@graph": homeStructuredData.map(item => {
      const {"@context": omittedContext, ...node} = item;
      return node;
    }),
  };
  const benefitTranslations = t("benefits.items", { returnObjects: true });
  const translatedBenefits = Array.isArray(benefitTranslations) ? benefitTranslations : [];
  const benefitDefinitions = [
    { id: "daily-contribution" },
    { id: "no-fees" },
    { id: "withdrawal-period" },
    { id: "interest-rate" },
  ];
  const benefits = benefitDefinitions.map(definition => ({
    ...definition,
    ...(translatedBenefits.find(item => item.id === definition.id) || {}),
  }));
  const benefitIntroductionParts = t("benefits.introduction").split(/(ACAM Vie|commencez à épargner|start saving)/g);
  const narrativePhrases = t("narrative.phrases", { returnObjects: true });
  const narrativeMessages = Array.isArray(narrativePhrases) ? narrativePhrases : [];
  const narrativeFirstMessage = narrativeMessages[1] || "";
  const narrativeSecondMessage = narrativeMessages[0] || "";
  const heroFeatures = [AccountBalanceWallet, TrendingUp, AccessTime];
  const heroFloatingIcons = [FaChartLine, FaShieldAlt, FaUsers];
  const heroTrustIcons = [LuShieldCheck, LuLock, LuUsers2, LuStar];
  const heroFeatureItems = t("hero.features", { returnObjects: true });
  const heroFloatingCards = t("hero.floatingCards", { returnObjects: true });
  const heroTrustItems = t("hero.trustItems", { returnObjects: true });
  const heroTrustBarRef = useRef(null);
  const heroTrustBarIsInView = useInView(heroTrustBarRef, { once: true, amount: 0.45 });
  const [heroTrustCountProgress, setHeroTrustCountProgress] = useState(0);

  useEffect(() => {
    if (!heroTrustBarIsInView) return;

    if (reduceMotion) {
      setHeroTrustCountProgress(1);
      return;
    }

    let animationFrame = 0;
    const startTime = performance.now();

    const updateCount = currentTime => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / HERO_TRUST_COUNT_DURATION, 1);
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      setHeroTrustCountProgress(easedProgress);

      if (progress < 1) animationFrame = requestAnimationFrame(updateCount);
    };

    animationFrame = requestAnimationFrame(updateCount);
    return () => cancelAnimationFrame(animationFrame);
  }, [heroTrustBarIsInView, reduceMotion]);

  return (
    <Box className="home-container">
      <SEOHead title={seoTitle} description={seoDescription} keywords={seoKeywords} lang={currentLang} structuredData={homeStructuredData} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{__html: JSON.stringify(homeStructuredGraph)}}
      />

      <Header />

      {/* 1. HERO SECTION */}
      <Box component="section" id="hero" className="hero-section" aria-labelledby="hero-title">
        <div className="hero-decoration" aria-hidden="true"><div className="hero-mobile-initial-photo" /><div className="hero-green-shape" /><div className="hero-contour-pattern" /><div className="hero-plant-glow" /></div>
        <div className="hero-main">
          <div className="hero-content">
            <div className="hero-badge hero-reveal hero-reveal-delay-1"><LuShieldCheck aria-hidden="true" /><span>{t("hero.accreditation")}</span></div>
            <h1 id="hero-title" className="hero-title hero-reveal hero-reveal-delay-2">{t("hero.title")}</h1>
            <p className="hero-description hero-reveal hero-reveal-delay-3">{t("hero.tagline")}</p>
            <div className="hero-features hero-reveal hero-reveal-delay-4">
              {(Array.isArray(heroFeatureItems) ? heroFeatureItems : []).map((feature, index) => { const FeatureIcon = heroFeatures[index]; return FeatureIcon ? <div className="hero-feature-item" key={feature.id}><span className="hero-feature-icon-wrap"><FeatureIcon className="hero-feature-icon" /></span><span>{feature.label}</span></div> : null; })}
            </div>
            <div className="hero-cta hero-reveal hero-reveal-delay-5">
              <Button className="hero-cta-primary" onClick={() => { context.togglePageLoading(true); window.location.href = Routes.SIMULER; }} startIcon={<Person2 />} aria-label={t("hero.actions.simulationLabel")}>{t("hero.actions.simulation")}</Button>
              <Button className="hero-cta-secondary" href="/faq" aria-label={t("hero.actions.learnMoreLabel")}>{t("hero.actions.learnMore")}</Button>
            </div>
          </div>
          <div className="hero-visual">
            <motion.div className="hero-phone-composite" initial={reduceMotion ? false : { opacity: 0, y: 36, scale: .96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: reduceMotion ? 0 : .9, delay: reduceMotion ? 0 : .15, ease: [0.16, 1, 0.3, 1] }}><motion.div className="hero-phone-float" animate={reduceMotion ? {} : { y: [0, -12, 0] }} transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}><Image src={mode === "dark" ? "/images/mobile-app/mockup-hero-dark.png" : "/images/mobile-app/mockup-hero-light.png"} alt={t("hero.phoneImageAlt")} fill priority sizes="(max-width: 639px) 390px, (max-width: 1023px) 625px, 700px" /></motion.div></motion.div>
            {(Array.isArray(heroFloatingCards) ? heroFloatingCards : []).map((card, index) => { const FloatingIcon = heroFloatingIcons[index]; return <motion.article key={card.id} className={`hero-floating-card hero-floating-${card.id}`} initial={reduceMotion ? false : { opacity: 0, scale: .9 }} animate={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 1, scale: 1, y: [0, index % 2 === 0 ? -12 : 11, 0] }} transition={reduceMotion ? { duration: 0 } : { opacity: { duration: .55, delay: .45 + index * .12 }, scale: { duration: .55, delay: .45 + index * .12 }, y: { duration: 3.6 + index * .45, repeat: Infinity, ease: "easeInOut", delay: index * .35 } }}><div className="hero-floating-heading"><span className="hero-floating-icon"><FloatingIcon aria-hidden="true" /></span><h3>{card.title}</h3></div>{card.value && <strong>{card.value}</strong>}<p>{card.description}</p></motion.article>; })}
          </div>
        </div>
        <div ref={heroTrustBarRef} className="hero-trust-bar">{(Array.isArray(heroTrustItems) ? heroTrustItems : []).map((item, index) => { const TrustIcon = heroTrustIcons[index]; return <div className="hero-trust-item" key={item.id}><TrustIcon aria-hidden="true" /><p><strong>{getAnimatedTrustTitle(item.id, item.title, heroTrustCountProgress)}</strong><span>{item.description}</span></p></div>; })}</div>
      </Box>

      {/* 2. BENEFITS SECTION */}
      <Box component="section" className="__box2 benefits-section" id="openlife-benefits" aria-labelledby="openlife-benefits-title">
        <div className="benefits-wrapper">
          <motion.header className="benefits-header" initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.55 }} transition={{ duration: reduceMotion ? 0 : 0.72, ease: [0.16, 1, 0.3, 1] }}>
            <div className="benefits-badge"><LuShieldCheck aria-hidden="true" /><span>{t("benefits.badge")}</span></div>
            <h2 id="openlife-benefits-title">{t("benefits.title")}</h2>
            <p className="benefits-introduction">
              {benefitIntroductionParts.map((part, index) => part === "ACAM Vie" || part === "commencez à épargner" || part === "start saving" ? <strong key={`${part}-${index}`}>{part}</strong> : part)}
            </p>
          </motion.header>

          <div className="benefits-cards-stage">
            <div className="benefits-cards">
              {benefits.map((benefit, index) => {
                const isNoFees = benefit.id === "no-fees";
                const isDailyContribution = benefit.id === "daily-contribution";
                return (
                  <motion.article key={benefit.id} className="benefit-card-motion" initial={reduceMotion ? false : { opacity: 0, y: 34 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.28 }} transition={{ duration: reduceMotion ? 0 : 0.68, delay: reduceMotion ? 0 : index * 0.08, ease: [0.16, 1, 0.3, 1] }}>
                    <div className={`benefit-card benefit-${benefit.id}`}>
                      <div className="benefit-card-content">
                        <div className="benefit-icon">
                          <BenefitIcon type={benefit.id} />
                          {isDailyContribution && <span className="benefit-icon-badge benefit-fcfa-badge">FCFA</span>}
                          {isNoFees && <span className="benefit-icon-badge benefit-check-badge"><LuCheck aria-hidden="true" /></span>}
                        </div>
                        <div className="benefit-copy">
                          {benefit.label && <p className="benefit-label">{benefit.label}</p>}
                          <p className={`benefit-value${isNoFees ? " benefit-value-no-fees" : ""}`}>{benefit.value}</p>
                          <div className={`benefit-description${isNoFees ? " benefit-description-no-fees" : ""}`}>
                            {(Array.isArray(benefit.description) ? benefit.description : []).map(line => <p key={line}>{line}</p>)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>

            <motion.svg
              className="benefits-flow-arrows"
              aria-hidden="true"
              viewBox="0 0 1000 330"
              preserveAspectRatio="none"
              fill="none"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.45 }}
            >
              <motion.path className="benefits-arrow-halo" d="M120 62C205 -10 326 -10 380 62" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12 } } } }} />
              <motion.path d="M120 62C205 -10 326 -10 380 62" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 1.05, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12 } } } }} />
              <motion.path d="M363 53L381 64L378 43" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : 0.92 }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.9 } } } }} />

              <motion.path className="benefits-arrow-halo" d="M625 268C610 345 454 345 380 268" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 1.05, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.18 } } } }} />
              <motion.path d="M625 268C610 345 454 345 380 268" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 1.05, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.18 } } } }} />
              <motion.path d="M399 274L378 266L385 286" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.28, delay: reduceMotion ? 0 : 1.1 }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 1.08 } } } }} />
            </motion.svg>

            <motion.svg
              className="benefits-mobile-flow-arrows"
              aria-hidden="true"
              viewBox="0 0 360 380"
              preserveAspectRatio="none"
              fill="none"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.45 }}
            >
              <motion.path className="benefits-arrow-halo" d="M285 39C255 2 193 2 158 39" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12 } } } }} />
              <motion.path d="M285 39C255 2 193 2 158 39" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12 } } } }} />
              <motion.path d="M174 34L157 40L164 23" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.25, delay: reduceMotion ? 0 : 0.78 }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.76 } } } }} />

              <motion.path className="benefits-arrow-halo" d="M7 283C-13 263-13 207 7 171" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.85, delay: reduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.15 } } } }} />
              <motion.path d="M7 283C-13 263-13 207 7 171" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.85, delay: reduceMotion ? 0 : 0.15, ease: [0.22, 1, 0.36, 1] }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.15 } } } }} />
              <motion.path d="M-2 183L7 171L15 186 " transform="rotate(25 7 171)" variants={{ hidden: { pathLength: reduceMotion ? 1 : 0, opacity: reduceMotion ? 1 : 0 }, visible: { pathLength: 1, opacity: 1, transition: { pathLength: { duration: reduceMotion ? 0 : 0.25, delay: reduceMotion ? 0 : 0.88 }, opacity: { duration: reduceMotion ? 0 : 0.12, delay: reduceMotion ? 0 : 0.86 } } } }} />
            </motion.svg>
          </div>
        </div>
      </Box>

      {/* 3. TRACKER SECTION */}
      <section ref={trackerSectionRef} className="tracker-section" id="openlife-experience" aria-labelledby="openlife-experience-title">
        <div className="tracker-sticky">
          <div className="tracker-decoration tracker-decoration-red" aria-hidden="true" />
          <div className="tracker-decoration tracker-decoration-green" aria-hidden="true" />
          <div className="tracker-glow" aria-hidden="true" />
          <header className="tracker-header">
            <h2 id="openlife-experience-title" className="text_h1">{t("experience.title")}</h2>
            <div className="tracker-title-mark" aria-hidden="true"><span /><span /></div>
          </header>
          <div className="tracker-container">
          <div className="tracker-left">
            <nav className="tracker-progress" aria-label={t("experience.progressLabel")}>
              {trackerFeatures.map((feature, idx) => (
                <button key={feature.id} type="button" className={`tracker-dot ${idx < activeTrackerIndex ? 'passed' : ''} ${activeTrackerIndex === idx ? 'active' : ''}`} aria-current={activeTrackerIndex === idx ? 'step' : undefined} onClick={() => scrollToTrackerStep(idx)}>
                  <span className="tracker-dot-point" aria-hidden="true" />
                  <span className="tracker-dot-label">{feature.title}</span>
                </button>
              ))}
            </nav>
            <div className="tracker-descriptions">
              <div className="tracker-desc-card active">
                <motion.div
                  key={activeTrackerFeature.id}
                  className="tracker-desc-inner"
                  initial={reduceMotion ? false : { opacity: 0, y: 58 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduceMotion ? 0 : 0.68, ease: [0.22, 1, 0.36, 1] }}
                >
                  <div className="tracker-desc-heading"><span className="tracker-desc-icon" aria-hidden="true">{activeTrackerFeature.icon}</span><h3>{activeTrackerFeature.title}</h3></div>
                  <p>{activeTrackerFeature.description}</p>
                </motion.div>
              </div>
            </div>
          </div>
          <div className="tracker-image-panel">
            <div className="tracker-image-wrapper">
              {trackerFeatures.map((feature, idx) => (
                <img key={feature.id} src={feature.image} alt={feature.imageAlt} className={activeTrackerIndex === idx ? 'tracker-img-active' : ''} />
              ))}
            </div>
          </div>
        </div>
        </div>
      </section>

      {/* 4. APP SHOWCASE */}
      <Box component="section" className='__box6' id="app-download-section" aria-labelledby="mobile-application-title">
        <div className="__wrapper-box6">
          <div className="__app-showcase-container">
            <div className="__app-showcase-content">
              <div className="__app-showcase-header">
                <motion.h2 id="mobile-application-title" className="__app-title" initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}>
                  <span className="__title-line1">{t("mobileApp.titleStart")}</span>
                  <span className="__title-line1 __title-highlight">{t("mobileApp.titleHighlight")}</span>
                  <span className="__app-title-mark" aria-hidden="true"><span /><span /></span>
                </motion.h2>
              </div>
              <div className="__app-features">
                <motion.div className="__app-feature-item" initial={reduceMotion ? false : { opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}>
                  <div className="__feature-icon"><span className="__icon-circle"><Shield /></span></div>
                  <div className="__feature-text"><h4>{t("mobileApp.features.0.title")}</h4><p>{t("mobileApp.features.0.description")}</p></div>
                </motion.div>
                <motion.div className="__app-feature-item" initial={reduceMotion ? false : { opacity: 0, x: -24 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.5 }} transition={{ duration: reduceMotion ? 0 : 0.6, delay: reduceMotion ? 0 : 0.1, ease: [0.16, 1, 0.3, 1] }}>
                  <div className="__feature-icon"><span className="__icon-circle"><TrendingUp /></span></div>
                  <div className="__feature-text"><h4>{t("mobileApp.features.1.title")}</h4><p>{t("mobileApp.features.1.description")}</p></div>
                </motion.div>
              </div>
              <div className="__app-download-buttons">
                <Link className="__app-store-btn __android-btn" target="_blank" href="https://play.google.com/store/apps/details?id=com.acamvie.open_life" aria-label={t("mobileApp.stores.0.ariaLabel")}><Adb className="__store-icon" />
                  <div className="__store-text"><span>{t("mobileApp.stores.0.eyebrow")}</span><strong>{t("mobileApp.stores.0.label")}</strong></div>
                </Link>
                <Link className="__app-store-btn __ios-btn" target="_blank" href="https://apps.apple.com/cm/app/open-life/id1628082679" aria-label={t("mobileApp.stores.1.ariaLabel")}><Apple className="__store-icon" />
                  <div className="__store-text"><span>{t("mobileApp.stores.1.eyebrow")}</span><strong>{t("mobileApp.stores.1.label")}</strong></div>
                </Link>
              </div>
            </div>
            <div className="__app-showcase-phone">
              <div className="__phone-stack" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)} >
                {phoneImages.map((image, index) => {
                  const position = (index - activePhone + phoneImages.length) % phoneImages.length;
                  return (
                    <div key={image.id} className={`__phone-stack-item __phone-stack-pos-${position}`}>
                      <img src={`/images/openlife_phoners/${mode === 'dark' ? 'dark' : 'light'}/${image.name}.jpeg`} className="__phone-stack-image" alt={t(`mobileApp.screens.${index}.alt`)} />
                    </div>
                  );
                })}
              </div>

                {/* DOTS NAVIGATION */}
                <div className="phone-dots absolute bottom-5 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 sm:bottom-7">
                  {phoneImages.map((image, index) => (
                    <button
                      key={image.id}
                      type="button"
                      className={`phone-dot-wrapper ${activePhone === index ? 'active' : ''}`}
                      onClick={() => setActivePhone(index)}
                      aria-label={image.name}
                    >
                      <span className="floating-whatsapp-tooltip phone-dot-tooltip">
                        {image.name === 'login' && 'Connexion'}
                        {image.name === 'dashboard' && 'Tableau de bord'}
                        {image.name === 'simulation' && 'Simulation'}
                        {image.name === 'collection' && 'Collection'}
                        {image.name === 'redemption' && 'Rachat'}
                      </span>
                      <span className="phone-dot" />
                    </button>
                  ))}
                </div>
            </div>
          </div>
        </div>
      </Box>

      {/* 5. TYPING INTERLUDE */}
      <Box
        component="section"
        ref={typingInterludeRef}
        id="typing-interlude"
        className="__box4"
        aria-labelledby="typing-interlude-title"
        sx={{ height: reduceMotion ? "100svh" : "330svh" }}
      >
        <h2 id="typing-interlude-title" className="typing-interlude-sr-only">{t("narrative.accessibilityTitle")}</h2>

        <div className="__wrapper-box4">
          <Image src="/images/les_mama.png" alt="" fill sizes="100vw" className="typing-interlude-image typing-interlude-image-today" />
          <motion.div className="typing-interlude-image-tomorrow" aria-hidden="true" style={{ opacity: reduceMotion ? 0 : typingTomorrowImageOpacity }}>
            <Image src="/images/parents_child.jpg" alt="" fill sizes="100vw" className="typing-interlude-image" />
          </motion.div>
          <div className="typing-interlude-overlay" aria-hidden="true" />

          <div className="typing-interlude-layout">
            <div className="typing-interlude-timeline" aria-hidden="true">
              <div className="typing-interlude-step typing-interlude-step-today">
                <span className="typing-interlude-step-main"><FaCheck /></span>
                <span className="typing-interlude-step-label">{t("narrative.todayLabel")}</span>
              </div>

              <div className="typing-interlude-step typing-interlude-step-tomorrow">
                <span className="typing-interlude-step-dot">
                  <span />
                  <motion.span className="typing-interlude-step-active" style={{ opacity: reduceMotion ? 0 : typingTomorrowActiveOpacity }}><FaCheck /></motion.span>
                </span>
                <span className="typing-interlude-step-label">{t("narrative.tomorrowLabel")}</span>
              </div>
            </div>

            <div className="typing-interlude-story">
              <span className="typing-interlude-mobile-label typing-interlude-mobile-label-today">{t("narrative.todayLabel")}</span>
              <motion.p
                className="typing-interlude-message typing-interlude-message-today"
                style={{
                  fontSize: reduceMotion ? "clamp(1.7rem, 3.6vw, 3.625rem)" : typingFirstFontSize,
                  lineHeight: reduceMotion ? 1.14 : typingFirstLineHeight,
                  opacity: reduceMotion ? 1 : typingFirstOpacity,
                }}
              >
                {narrativeFirstMessage}
              </motion.p>

              <span className="typing-interlude-mobile-label typing-interlude-mobile-label-tomorrow">{t("narrative.tomorrowLabel")}</span>
              <motion.p
                className="typing-interlude-message typing-interlude-message-tomorrow"
                style={{
                  fontSize: reduceMotion ? "clamp(0.95rem, 1.25vw, 1.125rem)" : typingSecondFontSize,
                  lineHeight: reduceMotion ? 1.45 : typingSecondLineHeight,
                  opacity: reduceMotion ? 0.78 : typingSecondOpacity,
                }}
              >
                {narrativeSecondMessage}
              </motion.p>

              <div className="typing-interlude-card">
                <motion.div className="typing-interlude-card-state" style={{ opacity: reduceMotion ? 1 : typingTodayCardOpacity }}>
                  <span className="typing-interlude-card-icon typing-interlude-card-icon-today"><FaCheck /></span>
                  <div className="typing-interlude-card-copy">
                    <p className="typing-interlude-card-title">{t("narrative.todayCard.title")}</p>
                    <p className="typing-interlude-card-value">{t("narrative.todayCard.value")}</p>
                    <p className="typing-interlude-card-description">{t("narrative.todayCard.description")}</p>
                  </div>
                  <FaChartLine className="typing-interlude-card-chart" aria-hidden="true" />
                </motion.div>

                <motion.div className="typing-interlude-card-state" style={{ opacity: reduceMotion ? 0 : typingTomorrowCardOpacity }}>
                  <span className="typing-interlude-card-icon typing-interlude-card-icon-tomorrow"><FaBullseye /></span>
                  <div className="typing-interlude-card-copy">
                    <p className="typing-interlude-card-title">{t("narrative.tomorrowCard.title")}</p>
                    <p className="typing-interlude-card-value typing-interlude-card-value-tomorrow">{t("narrative.tomorrowCard.value")}</p>
                    <p className="typing-interlude-card-description typing-interlude-card-description-tomorrow">
                      {t("narrative.tomorrowCard.description")}
                    </p>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </Box>

      {/* 6. FAQ SECTION */}
      <Box component="section" className="__box3 home-faq-section" id="faq-section" aria-labelledby="home-faq-title">
        <div className="home-faq-glow" aria-hidden="true" />
        <div className="home-faq-wrapper">
          <motion.header className="faq-header" initial={reduceMotion ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.6 }} transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}>
            <h2 id="home-faq-title">{t("homeFaq.title")}</h2>
            <div className="home-faq-title-mark" aria-hidden="true"><span /><span /></div>
            <p>{t("homeFaq.subtitle")}</p>
          </motion.header>
          <div className="home-faq-accordions">

            {homeFaqItems.map((item, index) => {
              const isOpen = openFaqId === item.id;
              const details = Array.isArray(item.details) ? item.details : [];
              return (
                <motion.div key={item.id} initial={reduceMotion ? false : { opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.25 }} transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : index * 0.055, ease: [0.22, 1, 0.36, 1] }}>
                  <Accordion disableGutters elevation={0} expanded={isOpen} onChange={(_, expanded) => setOpenFaqId(expanded ? item.id : false)} className="home-faq-item">
                    <AccordionSummary className="home-faq-summary" aria-controls={`${item.id}-content`} id={`${item.id}-header`} expandIcon={<span className="home-faq-toggle" aria-hidden="true"><span /><span /></span>}>
                      <span className="home-faq-summary-content">
                        <span className="accordion-number" aria-hidden="true">{index + 1}</span>
                        <span className="home-faq-question">{item.question}</span>
                      </span>
                    </AccordionSummary>
                    <AccordionDetails className="home-faq-details" id={`${item.id}-content`}>
                      <p className="home-faq-answer">{item.answer}</p>
                      {details.length > 0 && <ul className="home-faq-detail-list">{details.map(detail => <li key={detail}><span aria-hidden="true" /><span>{detail}</span></li>)}</ul>}
                    </AccordionDetails>
                  </Accordion>
                </motion.div>
              );
            })}
          </div>

        </div>
      </Box>

      {/* 7. ASSISTANCE SECTION */}
      <Box component="section" id="assistance" className="__box5 assistance-section" aria-labelledby="assistance-title">
        <div className="__assistance-glow" aria-hidden="true" />
        <div className="__wrapper-box5">
          <motion.header
            className="__assistance-header"
            initial={reduceMotion ? false : { opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.6 }}
            transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <h2 id="assistance-title" className="text_h1">{t("assistance.title")}</h2>
            <div className="assistance-title-mark" aria-hidden="true"><span /><span /></div>
          </motion.header>

          <div className="__contact-cards">
            {assistanceContacts.map((contact, contactIndex) => {
              const ContactIcon = contact.icon;
              const isExternal = contact.href.startsWith("http");
              return (
                <motion.article
                  key={contact.id}
                  className={`__contact-card __${contact.id}-card`}
                  initial={reduceMotion ? false : { opacity: 0, y: 32 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: reduceMotion ? 0 : 0.55, delay: reduceMotion ? 0 : contactIndex * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={reduceMotion ? undefined : { y: -7 }}
                >
                  <div className="__contact-card-glow" aria-hidden="true" />
                  <div className="__contact-icon-wrapper"><ContactIcon aria-hidden="true" /></div>
                  <h3 className="__contact-title">{contact.title}</h3>
                  <p className="__contact-description">{contact.description}</p>
                  <a href={contact.href} className="__contact-link" aria-label={contact.ariaLabel} target={isExternal ? "_blank" : undefined} rel={isExternal ? "noreferrer" : undefined}>
                    <span>{contact.value}</span>
                  </a>
                  <p className="__contact-status">{contact.status}</p>
                </motion.article>
              );
            })}
          </div>

          <motion.aside
            className="__referral-banner"
            aria-labelledby="business-partner-title"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: reduceMotion ? 0 : 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="__referral-content">
              <h3 id="business-partner-title" className="__referral-title">{t("assistance.business.title")}</h3>
              <p className="__referral-subtitle">{t("assistance.business.description")}</p>
            </div>
            <div className="__referral-action">
              <a href={businessWhatsappUrl} target="_blank" rel="noreferrer" className="__referral-button" aria-label={t("assistance.business.buttonAriaLabel")}>
                <span>{t("assistance.business.buttonLabel")}</span>
                <FaArrowRight aria-hidden="true" />
              </a>
            </div>
          </motion.aside>
        </div>
      </Box>

      {/* 8. FOOTER */}
      <Footer variant="detailed" />
      <FloatingWhatsApp />
    </Box>
  );
};

export default Home;
