"use client";

import Image from "next/image";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
} from "framer-motion";

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

  const currentYear =new Date().getFullYear();

  const countries = FOOTER_COUNTRIES.map(
      (country, index) => ({...country,name:content.footer.countries[index]?.name ?? "",}),
    );

  const socialLinks =
  FOOTER_SOCIAL_LINKS.map(
    (social, index) => ({
      ...social,label:content.footer.socialNetworks[index]?.name ?? "",
      ariaLabel:content.footer.socialNetworks[index]?.ariaLabel ?? "",
    }),
  );

  return (
    <footer
      className="
        openlife-footer-background
        relative isolate
        overflow-hidden
        text-white
      "
    >
      <div
        aria-hidden="true"
        className="
          pointer-events-none
          absolute inset-0 -z-10
          bg-[radial-gradient(circle_at_14%_100%,rgba(75,172,47,0.17),transparent_38%),radial-gradient(circle_at_90%_0%,rgba(0,43,0,0.19),transparent_42%)]
        "
      />

      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 22,
              }
        }
        whileInView={{
          opacity: 1,
          y: 0,
        }}
        viewport={{
          once: true,
          amount: 0.15,
        }}
        transition={{
          duration: reduceMotion
            ? 0
            : 0.7,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          relative z-10
          mx-auto
          w-[calc(100%-40px)]
          max-w-[1520px]
          pb-[28px]
          pt-[54px]
          sm:w-[calc(100%-64px)]
          sm:pb-[30px]
          sm:pt-[60px]
          lg:w-[80%]
        "
      >
        <div
          className="
            grid grid-cols-1
            gap-10
            sm:grid-cols-2
            sm:gap-x-16
            sm:gap-y-12
            lg:grid-cols-[1.85fr_0.95fr_1fr_0.85fr]
            lg:gap-[72px]
          "
        >
          <div>
            <Link
              href="/"
              aria-label={
                content.footer.homeLabel
              }
              className="
                relative block
                h-[82px] w-[155px]
                rounded-md
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#176b0c]
              "
            >
              <Image
                src="/images/branding/openlife-logo.webp"
                alt={
                  content.footer.logoAlt
                }
                fill
                priority={false}
                sizes="155px"
                className="
                  object-contain
                  object-left
                  brightness-0 invert
                "
              />
            </Link>

            <p
              className="
                mt-[18px]
                text-[16px]
                font-medium
                leading-[1.45]
                text-white/95
                sm:text-[17px]
              "
            >
              {content.footer.tagline}
            </p>
          </div>

          <nav
            aria-labelledby="footer-countries-title"
          >
            <h2
              id="footer-countries-title"
              className="
                text-[13px]
                font-extrabold
                uppercase
                tracking-[0.075em]
                text-white
              "
            >
              {content.footer.countriesTitle}
            </h2>

            <ul className="mt-[27px] space-y-[7px]">
              {countries.map((country) => (
                <li
                  key={country.id}
                  className="
                    flex items-center
                    gap-[9px]
                    text-[15px]
                    leading-none
                    text-white/95
                    sm:text-[16px]
                  "
                >
                  <span
                    aria-hidden="true"
                    className="
                      flex h-[21px]
                      w-[27px]
                      items-center
                      overflow-hidden
                      text-[21px]
                      leading-none
                    "
                  >
                    {country.flag}
                  </span>

                  <span>
                    {country.name}
                  </span>
                </li>
              ))}
            </ul>
          </nav>

          <nav
            aria-labelledby="footer-legal-title"
          >
            <h2
              id="footer-legal-title"
              className="
                text-[13px]
                font-extrabold
                uppercase
                tracking-[0.075em]
                text-white
              "
            >
              {content.footer.legalTitle}
            </h2>

            <a
              href={FOOTER_LINKS.privacy}
              target="_blank"
              rel="noreferrer"
              aria-label={
                content.footer.privacyAriaLabel
              }
              className="
                mt-[27px]
                inline-flex
                text-[15px]
                leading-[1.5]
                text-white/90
                underline-offset-4
                transition-colors
                duration-500
                hover:text-white
                hover:underline
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#176b0c]
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
          >
            <h2
              id="footer-social-title"
              className="
                text-[13px]
                font-extrabold
                uppercase
                tracking-[0.075em]
                text-white
              "
            >
              {content.footer.socialTitle}
            </h2>

            <ul
              className="
                mt-[26px]
                flex items-center
                gap-[12px]
              "
            >
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
                        aria-label={
                          social.ariaLabel
                        }
                        title={social.label}
                        className="
                          group
                          flex size-[48px]
                          items-center
                          justify-center
                          rounded-full
                          border
                          border-white/25
                          bg-white/[0.055]
                          text-white
                          shadow-[inset_0_0_0_1px_rgba(255,255,255,0.025)]
                          transition-[background-color,border-color,transform,box-shadow]
                          duration-500
                          hover:-translate-y-1
                          hover:border-white/50
                          hover:bg-white/15
                          hover:shadow-[0_8px_20px_rgba(0,0,0,0.14)]
                          focus-visible:outline-none
                          focus-visible:ring-2
                          focus-visible:ring-white
                          focus-visible:ring-offset-4
                          focus-visible:ring-offset-[#176b0c]
                        "
                      >
                        <Icon
                          aria-hidden="true"
                          className="
                            size-[16px]
                            transition-transform
                            duration-500
                            group-hover:scale-110
                          "
                        />
                      </a>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>
        </div>

        <div
          aria-hidden="true"
          className="
            mb-[33px]
            mt-[42px]
            h-px w-full
            bg-white/[0.09]
          "
        />

        <p
          className="
            mx-auto
            max-w-[1470px]
            text-center
            text-[12px]
            leading-[1.75]
            text-white/78
            sm:text-[13px]
          "
        >
          {content.footer.legalNotice}
        </p>

        <div
          className="
            mt-[25px]
            flex flex-col
            items-center
            justify-between
            gap-4
            text-center
            text-[13px]
            text-white/90
            sm:flex-row
            sm:text-left
            sm:text-[14px]
          "
        >
          <p>
            © {currentYear}{" "}
            {content.footer.copyright}
          </p>

          <p>
            {content.footer.developedBy}
            {" "}

            <a
              href={FOOTER_LINKS.developer}
              target="_blank"
              rel="noreferrer"
              aria-label={content.footer.developerAriaLabel}
              className="
                font-extrabold
                text-[#ff5a20]
                transition-colors
                duration-500
                hover:text-[#ff8a59]
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-white
                focus-visible:ring-offset-4
                focus-visible:ring-offset-[#176b0c]
              "
            >ELOHIM WARREN</a>
          </p>
        </div>
      </motion.div>
    </footer>
  );
}