import type {Metadata,} from "next";
import Script from "next/script";
import localFont from "next/font/local";
import type {ReactNode,} from "react";
import {I18nProvider,} from "@/components/i18n/i18nProvider";
import {FloatingWhatsApp,} from "@/components/layout/FloatingWhatsApp";
import {ThemeProvider,} from "@/components/theme/ThemeProvider";
import {DEFAULT_LOCALE,} from "@/i18n/config";
import {getSiteContent,} from "@/i18n/content";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = localFont({
  src: "../public/fonts/Inter-Variable.ttf",
  variable: "--font-sans",
  weight: "100 900",
  style: "normal",
  display: "swap",
});

const poppins = localFont({
  src: [
    {
      path: "../public/fonts/Poppins-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../public/fonts/Poppins-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../public/fonts/Poppins-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../public/fonts/Poppins-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-poppins",
  display: "swap",
});

const defaultContent =getSiteContent(DEFAULT_LOCALE,);

export const metadata:Metadata = {
    title:defaultContent.metadata.title,
    description:defaultContent.metadata.description,
    openGraph: {
      title:defaultContent.metadata.title,
      description:defaultContent.metadata.description,
      type: "website",
    },
  };

type RootLayoutProps =
  Readonly<{
    children: ReactNode;
  }>;

export default function RootLayout({
  children,
}: RootLayoutProps) {
  return (
    <html
      lang={DEFAULT_LOCALE}
      data-locale={DEFAULT_LOCALE}
      data-theme="light"
      suppressHydrationWarning
      className={cn("scheme-light", "font-sans", inter.variable)}
      style={{colorScheme: "light",}}
    >
      <head>
        <Script id="openlife-local-storage" strategy="beforeInteractive" />
      </head>

      <body
        className={`
          ${poppins.variable}
          bg-background
          font-(--font-poppins)
          text-foreground
          antialiased
        `}
      >
        <I18nProvider>
          <ThemeProvider>
            {children}
            <FloatingWhatsApp />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}