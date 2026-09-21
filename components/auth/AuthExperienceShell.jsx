"use client";

import React, {useEffect, useState} from "react";
import {Box, IconButton, Link, Paper, Typography} from "@mui/material";
import {ArrowBack, ArrowForward, Pause, PlayArrow} from "@mui/icons-material";
import Image from "next/image";
import {usePathname, useRouter} from "next/navigation";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";
import {useTranslation} from "react-i18next";
import SousHeader from "@/components/souscription/SousHeader";
import "@/styles/souscription.scss";

const AUTH_EXPERIENCE_ROUTES = new Set(["/login", "/forgot", "/reset"]);
const LOGIN_SLIDES = [
  {image: "/images/sous-img1.png", translationKey: "family"},
  {image: "/images/sous-img2.png", translationKey: "future"},
  {image: "/images/sous-img3.png", translationKey: "protection"},
];
const LOGIN_CAROUSEL_INTERVAL_MS = 6500;

const AuthExperienceShell = ({children}) => {
  const pathname = usePathname();
  const router = useRouter();
  const {t} = useTranslation();
  const reduceMotion = Boolean(useReducedMotion());
  const [activeSlide, setActiveSlide] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const currentSlide = LOGIN_SLIDES[activeSlide];

  useEffect(() => {
    if (!AUTH_EXPERIENCE_ROUTES.has(pathname) || carouselPaused || reduceMotion) return undefined;

    const timer = window.setInterval(() => {
      setActiveSlide(current => (current + 1) % LOGIN_SLIDES.length);
    }, LOGIN_CAROUSEL_INTERVAL_MS);

    return () => window.clearInterval(timer);
  }, [carouselPaused, pathname, reduceMotion]);

  if (!AUTH_EXPERIENCE_ROUTES.has(pathname)) return children;

  const showPreviousSlide = () => {
    setActiveSlide(current => (current - 1 + LOGIN_SLIDES.length) % LOGIN_SLIDES.length);
  };

  const showNextSlide = () => {
    setActiveSlide(current => (current + 1) % LOGIN_SLIDES.length);
  };

  return (
    <>
      <Box className="login-mobile-header" data-simulation-header>
        <SousHeader onBack={() => router.back()} />
      </Box>

      <Box className="login-shell">
        <Box component="section" className="login-story" aria-label={t("loginExperience.storyRegionLabel")}>
          {LOGIN_SLIDES.map((slide, index) => (
            <Image
              key={slide.image}
              src={slide.image}
              alt={index === activeSlide ? t(`loginExperience.slides.${slide.translationKey}.imageAlt`) : ""}
              fill
              priority={index === 0}
              sizes="(max-width: 900px) 100vw, 44vw"
              aria-hidden={index !== activeSlide}
              className={`login-story__image ${index === activeSlide ? "is-active" : ""}`}
            />
          ))}
          <Box className="login-story__overlay" />
          <Box className="login-story__content">
            <Link href="/" className="login-story__brand" aria-label={t("loginExperience.backHomeLabel")}>
              <Image src="/images/logo_blanc.png" alt={t("loginExperience.logoAlt")} width={164} height={79} />
            </Link>

            <Box className="login-story__bottom">
              <Box
                key={currentSlide.translationKey}
                className="login-story__copy"
                aria-live={carouselPaused ? "polite" : "off"}>
                <Typography component="p" className="login-story__eyebrow">
                  {t(`loginExperience.slides.${currentSlide.translationKey}.eyebrow`)}
                </Typography>
                <Typography component="h2" className="login-story__title">
                  {t(`loginExperience.slides.${currentSlide.translationKey}.title`)}
                </Typography>
                <Typography component="p" className="login-story__description">
                  {t(`loginExperience.slides.${currentSlide.translationKey}.description`)}
                </Typography>
              </Box>

              <Box className="login-story__navigation">
                <Box className="login-story__dots" aria-label={t("loginExperience.carouselPagination")}>
                  {LOGIN_SLIDES.map((slide, index) => (
                    <button
                      key={slide.translationKey}
                      type="button"
                      className={index === activeSlide ? "is-active" : ""}
                      aria-label={t("loginExperience.goToSlide", {number: index + 1})}
                      aria-current={index === activeSlide ? "true" : undefined}
                      onClick={() => setActiveSlide(index)}
                    />
                  ))}
                </Box>
                <Box className="login-story__actions">
                  <IconButton
                    onClick={() => setCarouselPaused(current => !current)}
                    aria-label={carouselPaused ? t("loginExperience.playCarousel") : t("loginExperience.pauseCarousel")}>
                    {carouselPaused ? <PlayArrow /> : <Pause />}
                  </IconButton>
                  <IconButton onClick={showPreviousSlide} aria-label={t("loginExperience.previousSlide")}>
                    <ArrowBack />
                  </IconButton>
                  <IconButton onClick={showNextSlide} aria-label={t("loginExperience.nextSlide")}>
                    <ArrowForward />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box component="main" className="login-access">
          <Paper elevation={0} className={`login-card is-${pathname.slice(1)}`}>
            <Box className="login-card__topbar">
              <SousHeader />
            </Box>

            <motion.div layout="size" className="login-card__route" transition={{duration: reduceMotion ? 0 : 0.28}}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={pathname}
                  initial={reduceMotion ? false : {opacity: 0, y: 8}}
                  animate={{opacity: 1, y: 0}}
                  exit={reduceMotion ? undefined : {opacity: 0, y: -6}}
                  transition={{duration: reduceMotion ? 0 : 0.2, ease: [0.22, 1, 0.36, 1]}}>
                  {children}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </Paper>
        </Box>
      </Box>
    </>
  );
};

export default AuthExperienceShell;
