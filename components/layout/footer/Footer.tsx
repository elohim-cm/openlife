import Image from "next/image";
import Link from "next/link";

import {FOOTER_COUNTRIES,FOOTER_LEGAL_TEXT,FOOTER_LINKS,FOOTER_SOCIAL_LINKS,} from "./footer.data";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="openlife-footer-background relative overflow-hidden text-white">
      <div  aria-hidden="true" className="pointer-events-none absolute -left-32.5 top-5 size-84 rounded-full bg-white/[0.035] blur-[80px]"/>
      <div aria-hidden="true" className="pointer-events-none absolute -right-30 bottom-40 size-95 rounded-full bg-black/10 blur-[90px] "/>

      <div className=" relative z-10 mx-auto w-full max-w-[1540px] px-5 pb-7 pt-12 sm:px-8 sm:pb-8 sm:pt-14 lg:px-10 lg:pb-6 lg:pt-13 " >
        <div className="grid grid-cols-1 gap-11 sm:grid-cols-2 lg:grid-cols-[1.35fr_0.7fr_0. 85fr_0.7fr] lg:gap-17.5 ">
          <div>
            <Link href="/" aria-label="Retour à l’accueil Open Life" className="relative block h-17 w-37.5 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand">
              <Image src="/images/branding/openlife-logo.webp" alt="Open Life" fill sizes="150px" className=" object-contain object-left brightness-0 invert "/>
            </Link>

            <p className="mt-4.25 text-[15px] text-white/90 ">Votre assurance, simplifiée.</p>
          </div>

          <nav aria-labelledby="footer-countries-title">
            <h2 id="footer-countries-title" className=" text-[13px] font-bold uppercase tracking-[0.08em] text-white ">Pays</h2>

            <ul className="mt-4.75 space-y-2.25">
              {FOOTER_COUNTRIES.map((country) => (
                  <li key={country.id} className=" flex items-center gap-2.25 text-[14px] text-white/85">
                    <span aria-hidden="true" className="text-[21px] leading-none" >{country.flag}</span>
                    <span> {country.name} </span>
                  </li>
                ),
              )}
            </ul>
          </nav>

          <nav aria-labelledby="footer-legal-title">
            <h2 id="footer-legal-title" className=" text-[13px] font-bold uppercase tracking-[0.08em] text-white">Légal</h2>

            <a href={FOOTER_LINKS.privacy} target="_blank" rel="noreferrer" className=" mt-5 inline-flex max-w-45 text-[14px] leading-normal text-white/80 transition-colors duration-200 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand">Politique de confidentialité</a>
          </nav>

          <nav aria-labelledby="footer-social-title">
            <h2 id="footer-social-title" className="text-[13px] font-bold uppercase tracking-[0.08em] text-white">Suivez-nous</h2>
            <ul className="mt-4.75 flex items-center gap-2.5">
              {FOOTER_SOCIAL_LINKS.map((social) => {
                  const Icon = social.icon;
                  return (
                    <li key={social.id}>
                      <a href={social.href} target="_blank" rel="noreferrer" aria-label={`Suivre Open Life sur ${social.label}`} 
                        className="group flex size-10 items-center justify-center rounded-full border border-white/20 bg-white/6 text-white transition-[background-color,border-color, transform] duration-200 hover:-translate-y-1 hover:border-white/40 hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand " >
                        <Icon aria-hidden="true" className="size-3.75 transition-transform duration-200 group-hover:scale-110 " />
                      </a>
                    </li>
                  );
                },
              )}
            </ul>
          </nav>
        </div>

        <div aria-hidden="true" className=" my-7.5 h-px w-full bg-white/10 lg:mb-6.75 lg:mt-8.5 "/>

        <p className=" mx-auto max-w-287.5 text-center text-[11px] leading-[1.7] text-white/70 sm:text-[12px] ">{FOOTER_LEGAL_TEXT}</p>
        <div className=" mt-5.75 flex flex-col items-center justify-between gap-3 text-center text-[12px] text-white/75 sm:flex-row sm:text-left ">
          <p>© {currentYear} ACAM Vie. Tous droits réservés.</p>

          <p> Développé par{" "} <a href={FOOTER_LINKS.developer} target="_blank" rel="noreferrer" className=" font-bold text-[#ff6a29] transition-colors duration-200 hover:text-[#ff8a59] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand">ELOHIM WARREN</a>
          </p>
        </div>
      </div>
    </footer>
  );
}