"use client";

import Image from "next/image";
import Link from "next/link";
import {FaAndroid,FaApple,FaUser} from "react-icons/fa";

import {LanguageToggle} from "@/components/layout/LanguageToggle";
import {ThemeToggle} from "@/components/theme/ThemeToggle";
import {useScrolled} from "@/hooks/useScrolled";
import {useSiteContent} from "@/hooks/useSiteContent";
import {cn} from "@/utils/cn";

const HEADER_LINKS = {
  android: "https://play.google.com/store/apps/details?id=com.acamvie.open_life",
  apple: "https://apps.apple.com/cm/app/open-life/id1628082679",
  account: "https://openlife.acamvie.com/login",
} as const;

export function Header() {
  const isScrolled = useScrolled(10);
  const content = useSiteContent();

  return (
    <header
      className={cn(`fixed inset-x-0 top-0 z-50 h-20 transition-[background-color,box-shadow,border-color,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`,
        isScrolled? "h-22 bg-surface/75 backdrop-blur-xl border-border/40 shadow-header" : "h-20 border-transparent shadow-none",
      )}
    >
      <div className=" mx-auto flex h-full w-full max-w-350 items-center justify-between px-3 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-6 lg:px-8 xl:px-10">
        <Link href="/" aria-label={ content.header.homeLabel }
          className={cn(` relative block h-auto shrink-0 transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] `,
            isScrolled? "aspect-140/68 w-[clamp(5rem,20vw,8.75rem)] max-[359px]:w-[72px] sm:aspect-auto sm:h-15 sm:w-33": "aspect-145/68 w-[clamp(6rem,21vw,9.0625rem)] max-[359px]:w-[72px] sm:aspect-auto sm:h-17 sm:w-36.25",
          )}
        >
          <Image src="/images/branding/openlife-logo.webp" alt={content.header.logoAlt} fill priority sizes="145px"
            className=" object-contain object-left dark:brightness-0 dark:invert "
          />
        </Link>

        <nav aria-label={ content.header.navigationLabel }
          className={cn(` flex items-center rounded-[11px] border border-border/25 bg-surface/60 backdrop-blur-lg transition-[height,padding,box-shadow,background-color,border-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] `,
            isScrolled? "h-14 px-1.5 shadow-sm sm:px-5 lg:px-6.5" : "h-14 px-1.5 shadow-none sm:px-5 lg:px-7",
          )}
        >
          <a href={ HEADER_LINKS.android } target="_blank" rel="noreferrer" aria-label={ content.header.androidLabel }
            className="flex size-9 items-center justify-center rounded-full text-icon transition-colors duration-500 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <FaAndroid aria-hidden="true" className="size-4.25"/>
          </a>

          <a href={ HEADER_LINKS.apple } target="_blank" rel="noreferrer" aria-label={ content.header.appleLabel }
            className="ml-0.5 flex size-9 items-center justify-center rounded-full text-icon transition-colors duration-500 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 sm:ml-1 "
          >
            <FaApple aria-hidden="true" className="size-4.5"/>
          </a>

          <span aria-hidden="true" className="mx-1 h-4.5 w-px bg-border-strong sm:mx-2.5 "/>
          <Link href={ HEADER_LINKS.account } aria-label={ content.header.accountLabel }
            className="flex h-9 items-center gap-1.25 rounded-md px-1 text-icon transition-colors duration-500 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <span className=" hidden whitespace-nowrap text-[16px] font-normal leading-none md:inline ">{content.header.account}</span>
            <FaUser aria-hidden="true" className="size-4" />
          </Link>

          <LanguageToggle className="ml-1 sm:ml-2"/>
          <ThemeToggle className="ml-0.5 sm:ml-1"/>
        </nav>
      </div>
    </header>
  );
}
