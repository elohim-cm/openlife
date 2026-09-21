"use client";

import React from "react";
import { Box } from "@mui/material";
import { Facebook, LinkedIn, Twitter } from "@mui/icons-material";
import Image from "next/image";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import logoWhite from "@/public/images/logo_blanc.png";
import cameroonFlag from "@/public/images/flags/cameroon.svg";
import rcaFlag from "@/public/images/flags/rca.svg";

const Footer = ({ variant = "simple" }) => {
  const { t } = useTranslation();

  const legalText =
    variant === "detailed" ? (
      <>
        <p>{t("publicFooter.detailedLegalFirst")} {t("publicFooter.detailedLegalSecond")}</p>
      </>
    ) : (
      <p>{t("publicFooter.simpleLegal")}</p>
    );

  return (
    <Box className="__wrapper-footer">
      <div className="__footer-main">
        <div className="__footer-brand">
          <Image
            className="__footer-logo"
            src={logoWhite}
            alt={t("publicFooter.logoAlt")}
          />
          {/* <p className="__footer-tagline">{t("publicFooter.tagline")}</p> */}
        </div>

        <div className="__footer-links __footer-countries-section">
          <h4 className="__footer-title">{t("publicFooter.countriesTitle")}</h4>
          <div className="__footer-countries">
            <span className="__country-item">
              <Image src={cameroonFlag} alt={t("publicFooter.cameroon")} />
              {t("publicFooter.cameroon")}
            </span>
            <span className="__country-item">
              <Image src={rcaFlag} alt={t("publicFooter.centralAfricanRepublic")} />
              {t("publicFooter.centralAfricanRepublicShort")}
            </span>
          </div>
        </div>

        <div className="__footer-links __footer-legal-section">
          <h4 className="__footer-title">{t("publicFooter.legalTitle")}</h4>
          <Link className="__footer-link" href="/privacy">{t("publicFooter.privacyPolicy")}</Link>
          <Link className="__footer-link" href="/faq">{t("publicFooter.faq")}</Link>
        </div>

        <div className="__footer-social">
          <h4 className="__footer-title">{t("publicFooter.followUs")}</h4>
          <div className="__social-icons">
            <Link
              className="__social-link __facebook"
              href="https://www.facebook.com/OpenLifebyACAMVie"
              target="_blank"
              aria-label={t("publicFooter.facebookLabel")}
            >
              <Facebook className="__social-icon" />
            </Link>
            <Link
              className="__social-link __linkedin"
              href="https://www.linkedin.com/company/openlifebyacamvie"
              target="_blank"
              aria-label={t("publicFooter.linkedinLabel")}
            >
              <LinkedIn className="__social-icon" />
            </Link>
            <Link
              className="__social-link __twitter"
              href="https://twitter.com/OpenLif24397584"
              target="_blank"
              aria-label={t("publicFooter.twitterLabel")}
            >
              <Twitter className="__social-icon" />
            </Link>
          </div>
        </div>
      </div>

      <div className="__footer-bottom">
        <div className="__footer-legal">{legalText}</div>
        <div className="__footer-credits">
          <p>{t("publicFooter.copyright", { year: new Date().getFullYear() })}</p>
          <p className="__developer">
            {t("publicFooter.developedBy")}{" "}
            <Link href="https://karbura.com/" target="_blank">
              KARBURA S.A
            </Link>
          </p>
        </div>
      </div>
    </Box>
  );
};

export default Footer;
