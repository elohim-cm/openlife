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
      className={cn(`fixed inset-x-0 top-0 z-50 h-26.5 transition-[background-color,box-shadow,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]`,
        isScrolled? "h-22 bg-background shadow-header" : "h-26.5 bg-transparent shadow-none",
      )}
    >
      <div className=" mx-auto flex h-full w-full max-w-350 items-center justify-between px-4 transition-[padding] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-6 lg:px-8 xl:px-10 ">
        <Link href="/" aria-label={ content.header.homeLabel }
          className={cn(` relative block shrink-0 transition-[width,height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] `,
            isScrolled? "h-14.5 w-33": "h-17 w-36.25",
          )}
        >
          <Image src="/images/branding/openlife-logo.webp" alt={content.header.logoAlt} fill priority sizes="145px"
            className=" object-contain object-left dark:brightness-0 dark:invert "
          />
        </Link>

        <nav aria-label={ content.header.navigationLabel }
          className={cn(` flex items-center rounded-[11px] border border-transparent bg-surface/95 transition-[height,padding,box-shadow,background-color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] `,
            isScrolled? "h-14 px-3 shadow-sm sm:px-5 lg:px-6.5" : "h-14 px-3 shadow-none sm:px-5 lg:px-7",
          )}
        >
          <a href={ HEADER_LINKS.android } target="_blank" rel="noreferrer" aria-label={ content.header.androidLabel }
            className="flex size-9 items-center justify-center rounded-full text-icon transition-colors duration-500 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <FaAndroid aria-hidden="true" className="size-4.25"/>
          </a>

          <a href={ HEADER_LINKS.apple } target="_blank" rel="noreferrer" aria-label={ content.header.appleLabel }
            className="ml-1 flex size-9 items-center justify-center rounded-full text-icon transition-colors duration-500 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 "
          >
            <FaApple aria-hidden="true" className="size-4.5"/>
          </a>

          <span aria-hidden="true" className="mx-2 h-4.5 w-px bg-border-strong sm:mx-2.5 "/>
          <Link href={ HEADER_LINKS.account } aria-label={ content.header.accountLabel }
            className="flex h-9 items-center gap-1.25 rounded-md px-1 text-icon transition-colors duration-500 hover:bg-brand-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2"
          >
            <span className=" hidden whitespace-nowrap text-[16px] font-normal leading-none md:inline ">{content.header.account}</span>
            <FaUser aria-hidden="true" className="size-4" />
          </Link>

          <LanguageToggle className="ml-2"/>
          <ThemeToggle className="ml-1"/>
        </nav>
      </div>
    </header>
  );
}