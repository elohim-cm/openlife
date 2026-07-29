import type {Metadata,} from "next";
import Script from "next/script";
import {Poppins, Inter } from "next/font/google";
import type {ReactNode,} from "react";
import {I18nProvider,} from "@/components/i18n/i18nProvider";
import {FloatingWhatsApp,} from "@/components/layout/FloatingWhatsApp";
import {ThemeProvider,} from "@/components/theme/ThemeProvider";
import {DEFAULT_LOCALE,} from "@/i18n/config";
import {getSiteContent,} from "@/i18n/content";

import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400","500","600","700",],
  display: "swap",
  variable: "--font-poppins",
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