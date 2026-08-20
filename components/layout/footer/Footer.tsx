"use client";

import {
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaShieldAlt } from "react-icons/fa";

import { useSiteContent } from "@/hooks/useSiteContent";

import {
  FOOTER_COUNTRIES,
  FOOTER_LINKS,
  FOOTER_SOCIAL_LINKS,
} from "./footer.data";

export function Footer() {
  const content = useSiteContent();
  const reduceMotion = Boolean(
    useReducedMotion(),
  );
  const currentYear =
    new Date().getFullYear();

  const countries =
    FOOTER_COUNTRIES.map(
      (country, index) => ({
        ...country,
        name:
          content.footer
            .countries[index]
            ?.name ?? "",
      }),
    );

  const socialLinks =
    FOOTER_SOCIAL_LINKS.map(
      (social, index) => ({
        ...social,
        label:
          content.footer
            .socialNetworks[index]
            ?.name ?? "",
        ariaLabel:
          content.footer
            .socialNetworks[index]
            ?.ariaLabel ?? "",
      }),
    );

  return (
    <footer
      className="
        openlife-footer-background
        relative isolate
        overflow-hidden
        border-t border-[#e42b1c]/55
        text-white
      "
    >
      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 24,
              }
        }
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.12,
        }}
        transition={{
          duration:
            reduceMotion ? 0 : 0.8,
          ease: [
            0.16,
            1,
            0.3,
            1,
          ],
        }}
        className="
          relative z-10
          mx-auto
          w-[calc(100%-40px)]
          max-w-[1450px]
          pb-8 pt-10
          sm:w-[calc(100%-64px)]
          sm:pb-9
          lg:w-[88%]
          lg:pb-10
        "
      >
        <div
          className="
            grid grid-cols-1
            gap-9
            sm:grid-cols-2
            sm:gap-x-14
            sm:gap-y-14
            lg:grid-cols-[1.55fr_0.9fr_1.2fr_0.95fr]
            lg:gap-0
          "
        >
          <div className="lg:pr-16">
            <Link
              href="/"
              aria-label={
                content.footer.homeLabel
              }
              className="
                relative block
                h-[104px] w-[210px]
                rounded-lg
                transition-opacity
                hover:opacity-90
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#073f1f]
              "
            >
              <Image
                src="/images/branding/openlife-logo.webp"
                alt={
                  content.footer.logoAlt
                }
                fill
                sizes="210px"
                className="
                  object-contain
                  object-left
                  brightness-0
                  invert
                "
              />
            </Link>

            <p
              className="
                mt-5
                max-w-[320px]
                text-[17px]
                font-normal
                leading-[1.55]
                text-white/72
                sm:text-[18px]
              "
            >
              {content.footer.tagline}
            </p>
          </div>

          <nav
            aria-labelledby="footer-countries-title"
            className="
              lg:border-l
              lg:border-white/18
              lg:pl-5
              lg:pr-5
            "
          >
            <h2
              id="footer-countries-title"
              className="
                text-[20px]
                font-bold
                leading-tight
                text-white
              "
            >
              {
                content.footer
                  .countriesTitle
              }
            </h2>

            <span
              aria-hidden="true"
              className="
                mt-3 block
                h-[3px] w-8
                rounded-full
                bg-[#65a848]
              "
            />

            <ul className="mt-5 flex flex-row flex-nowrap items-center gap-6">
              {countries.map(
                (country) => (
                  <li
                    key={country.id}
                    className="
                      flex items-center
                      gap-4
                      text-[16px]
                      font-semibold
                      text-white/94
                    "
                  >
                    <span
                      aria-hidden="true"
                      className="
                        flex size-12
                        shrink-0
                        items-center
                        justify-center
                        overflow-hidden
                        rounded-full
                        border
                        border-white/25
                        bg-white/8
                        text-[27px]
                        shadow-[inset_0_0_0_2px_rgba(255,255,255,0.04)]
                      "
                    >
                      {country.flag}
                    </span>

                    <span>
                      {country.name}
                    </span>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-legal-title"
            className="
              lg:border-l
              lg:border-white/18
              lg:pl-5
            "
          >
            <h2
              id="footer-legal-title"
              className="
                text-[20px]
                font-bold
                leading-tight
                text-white
              "
            >
              {
                content.footer
                  .legalTitle
              }
            </h2>

            <span
              aria-hidden="true"
              className="
                mt-3 block
                h-[3px] w-8
                rounded-full
                bg-[#65a848]
              "
            />

            <a
              href={
                FOOTER_LINKS.privacy
              }
              target="_blank"
              rel="noreferrer"
              aria-label={
                content.footer
                  .privacyAriaLabel
              }
              className="
                mt-5 inline-flex
                text-[15px]
                leading-[1.55]
                text-white/84
                underline-offset-4
                transition-colors
                hover:text-white
                hover:underline
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#073f1f]
                sm:text-[16px]
              "
            >
              {
                content.footer
                  .privacyPolicy
              }
            </a>
          </nav>

          <nav
            aria-labelledby="footer-social-title"
            className="
              lg:border-l
              lg:border-white/18
              lg:pl-5
            "
          >
            <h2
              id="footer-social-title"
              className="
                text-[20px]
                font-bold
                leading-tight
                text-white
              "
            >
              {content.footer.socialTitle}
            </h2>

            <span
              aria-hidden="true"
              className="
                mt-3 block
                h-[3px] w-8
                rounded-full
                bg-[#65a848]
              "
            />

            <ul className="mt-5 flex flex-row flex-nowrap items-center gap-4">
              {socialLinks.map(
                (social) => {
                  const Icon =
                    social.icon;

                  return (
                    <li key={social.id}>
                      <a
                        href={social.href}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={social.ariaLabel}
                        title={social.label}
                        className="
                          text-[16px]
                          font-medium
                          text-white/88
                          transition-colors
                          hover:text-white
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-white
                          focus-visible:ring-offset-4
                          focus-visible:ring-offset-[#073f1f]
                        "
                      >
                        <span
                          className="
                            flex size-12
                            items-center
                            justify-center
                            rounded-full
                            border
                            border-[#73aa51]/65
                            bg-white/4
                            text-white
                            transition-[background-color,border-color,transform,box-shadow]
                            group-hover:-translate-y-0.5
                            group-hover:border-white/50
                            group-hover:bg-white/12
                            group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.18)]
                          "
                        >
                          <Icon
                            aria-hidden="true"
                            className="size-4.5"
                          />
                        </span>
                      </a>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>
        </div>

        <p
          className="
            mx-auto mt-5
            max-w-[920px]
            text-center
            text-[12px]
            leading-[1.75]
            text-white/62
            sm:text-[13px]
          "
        >
          {content.footer.legalNotice}
        </p>

        <div
          className="
            mt-4
            flex flex-col
            items-center
            justify-between
            gap-4
            text-center
            text-[13px]
            text-white/72
            sm:flex-row
            sm:text-left
            sm:text-[14px]
          "
        >
          <p>© {currentYear}{" "}{content.footer.copyright}</p>

          <p>{content.footer.developedBy}{" "}
            <a href={FOOTER_LINKS.developer}
              target="_blank"
              rel="noreferrer"
              aria-label={content.footer.developerAriaLabel}
              className="
                font-extrabold
                text-[#ff6a4f]
                transition-colors
                hover:text-[#ff6a4f]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#073f1f]
              ">
              KARBURA S.A
            </a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
}