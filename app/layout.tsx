import type {Metadata} from "next";
import {cookies} from "next/headers";
import {Poppins} from "next/font/google";
import type {ReactNode} from "react";

import {I18nProvider} from "@/components/i18n/i18nProvider";
import {FloatingWhatsApp} from "@/components/layout/FloatingWhatsApp";
import {ThemeProvider} from "@/components/theme/ThemeProvider";
import {DEFAULT_LOCALE,LOCALE_COOKIE_NAME} from "@/i18n/config";
import {isLocale} from "@/types/i18n";
import type {Theme} from "@/types/theme";
import {isTheme,THEME_COOKIE_NAME} from "@/utils/theme";

import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: [
    "400",
    "500",
    "600",
    "700",
  ],
  display: "swap",
  variable: "--font-poppins",
});

export const metadata:
  Metadata = {
    title: "OpenLife",
    description:
      "Digital daily savings - Épargne journalière digitale",
  };

type RootLayoutProps = Readonly<{children: ReactNode;}>;

export default async function RootLayout({
  children,
}: RootLayoutProps) {
  const cookieStore = await cookies();
  const storedLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const initialLocale = isLocale(storedLocale)? storedLocale: DEFAULT_LOCALE;
  const storedTheme =cookieStore.get(THEME_COOKIE_NAME)?.value;

  const initialTheme:
    Theme =
    isTheme(storedTheme)
      ? storedTheme
      : "light";

  const htmlThemeClass =
    initialTheme === "dark"
      ? "dark scheme-dark"
      : "scheme-light";

  return (
    <html
      lang={initialLocale}
      data-locale={initialLocale}
      data-theme={initialTheme}
      suppressHydrationWarning className={htmlThemeClass}
      style={{colorScheme:initialTheme,}}
    >
      <body className={`${poppins.variable} bg-background font--font-poppins text-foreground antialiased`}>
        <I18nProvider initialLocale={initialLocale}>
          <ThemeProvider initialTheme={initialTheme}>
            {children}
            <FloatingWhatsApp />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}