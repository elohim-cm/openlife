"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  type FormEvent,
  useMemo,
  useState,
} from "react";
import {
  FaArrowLeft,
} from "react-icons/fa";

import {
  Button,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Input,
} from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useLocale,
} from "@/hooks/useLocale";
import {
  useSiteContent,
} from "@/hooks/useSiteContent";

import {
  calculateSimulation,
  MINIMUM_DAILY_PREMIUM,
  type SimulationResult,
} from "./simulation-calculator";
import {LanguageToggle} from "@/components/layout/LanguageToggle";
import {ThemeToggle} from "@/components/theme/ThemeToggle";

type FormErrors = {
  premium?: string;
  duration?: string;
};

export function SimulationPageContent() {
  const content = useSiteContent();
  const { locale } = useLocale();
  const reduceMotion = Boolean(
    useReducedMotion(),
  );

  const [premium, setPremium] =
    useState("");

  const [duration, setDuration] =
    useState("");

  const [errors, setErrors] =
    useState<FormErrors>({});

  const [result, setResult] =
    useState<SimulationResult | null>(
      null,
    );

  const currencyFormatter =
    useMemo(
      () =>
        new Intl.NumberFormat(
          locale === "fr"
            ? "fr-FR"
            : "en-US",
          {
            maximumFractionDigits: 0,
          },
        ),
      [locale],
    );

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(
        locale === "fr"
          ? "fr-FR"
          : "en-GB",
        {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        },
      ),
    [locale],
  );

  const formatCurrency = (
    value: number,
  ): string =>
    `${currencyFormatter.format(
      Math.round(value),
    )} FCFA`;

  const handleSubmit = (
    event: FormEvent<HTMLFormElement>,
  ): void => {
    event.preventDefault();

    const parsedPremium =
      Number(premium);

    const parsedDuration =
      Number(duration);

    const nextErrors: FormErrors = {};

    if (
      premium.trim() === "" ||
      !Number.isFinite(parsedPremium)
    ) {
      nextErrors.premium =
        content.simulationPage.errors.requiredPremium;
    } else if (
      parsedPremium <
      MINIMUM_DAILY_PREMIUM
    ) {
      nextErrors.premium =
        content.simulationPage.errors.minimumPremium;
    }

    if (
      duration.trim() === "" ||
      !Number.isFinite(parsedDuration)
    ) {
      nextErrors.duration =
        content.simulationPage.errors.requiredDuration;
    } else if (
      parsedDuration <= 0 ||
      !Number.isInteger(parsedDuration)
    ) {
      nextErrors.duration =
        content.simulationPage.errors.invalidDuration;
    }

    setErrors(nextErrors);

    if (
      Object.keys(nextErrors)
        .length > 0
    ) {
      setResult(null);
      return;
    }

    setResult(
      calculateSimulation(
        parsedPremium,
        parsedDuration,
      ),
    );
  };

  return (
    <main
      className="
        relative isolate overflow-hidden
        min-h-screen
        border-t-2 border-heading-secondary
        bg-[var(--hero-stage-background)]
        px-7 pb-[80px]
        pt-20
        sm:px-6 sm:pt-[128px]
        lg:px-10
      "
    >

      <div aria-hidden="true" className="
          pointer-events-none z-0
          absolute top-[80px]
          size-[480px]
          -translate-x-1/2
          rounded-full
          bg-cta-soft
          blur-[120px]
          sm:size-[800px]
          lg:size-[720px]
        "
      />
      
      <motion.div
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
              }
        }
        animate={{
          opacity: 1,
        }}
        transition={{
          duration: reduceMotion
            ? 0
            : 0.65,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="
          fixed inset-x-0 top-0 z-50
          h-20 w-full
          border-b border-border/40
          bg-surface/75
          shadow-header
          backdrop-blur-xl
          sm:h-[90px]
        "
      >
        <div
          className="
            mx-auto flex h-full
            w-full max-w-[1450px]
            items-center justify-between
            px-3
            sm:px-6
            lg:px-8
          "
        >
        <Link
          href="/"
          aria-label={
            content.simulationPage.logoHomeLabel
          }
          className="
            relative block
            h-auto
            shrink-0
            aspect-145/68
            w-[clamp(6rem,21vw,9.0625rem)]
            max-[359px]:w-[72px]
            transition-[width,height,transform]
            duration-300
            ease-[cubic-bezier(0.22,1,0.36,1)]
            hover:scale-[1.02]
            sm:aspect-auto
            sm:h-17 sm:w-36.25
          "
        >
          <Image
            src="/images/branding/openlife-logo.webp"
            alt={
              content.header.logoAlt
            }
            fill
            priority
            sizes="145px"
            className="
              object-contain object-left
              dark:brightness-0
              dark:invert
            "
          />
        </Link>
        

        <div
          className="
            ml-auto
            flex items-center
            justify-end
            gap-1
            sm:gap-3
          "
        >
          <LanguageToggle />

          <ThemeToggle />

          <Button
            asChild
            className="
              size-11
              rounded-[4px]
              bg-heading-secondary
              px-0
              text-[14px] font-bold
              uppercase text-text-inverse
              shadow-card
              transition-[background-color,box-shadow,transform]
              duration-500
              ease-[cubic-bezier(0.22,1,0.36,1)]
              hover:-translate-y-0.5
              hover:bg-brand
              hover:shadow-card-hover
              sm:h-[45px]
              sm:w-auto
              sm:px-[22px]
            "
          >
            <Link
              href="/"
              aria-label={
                content.simulationPage
                  .backLabel
              }
              className="
                inline-flex
                items-center
                gap-2
              "
            >
              <FaArrowLeft
                aria-hidden="true"
                className="size-[17px]"
              />

              <span className="hidden sm:inline">
                {content.simulationPage.back}
              </span>
            </Link>
          </Button>
        </div>
        </div>
      </motion.div>

      <motion.h1
        initial={
          reduceMotion
            ? false
            : {
                opacity: 0,
                y: 22,
              }
        }
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: reduceMotion
            ? 0
            : 0.7,
          delay: reduceMotion
            ? 0
            : 0.08,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ],
        }}
        className="
          relative z-10
          mx-auto mt-[34px]
          text-center
          text-[35px] font-normal
          leading-tight
          tracking-[-0.035em]
          text-heading-secondary
          sm:mt-[38px]
          sm:text-[45px]
          lg:text-[55px]
        "
      >
        {content.simulationPage.title}
      </motion.h1>
      

      <div
        className="
          relative z-10
          mx-auto mt-[40px]
          grid w-full
          max-w-[1450px]
          items-start gap-[20px]
          lg:grid-cols-[350px_minmax(0,1fr)]
        "
      >
        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: -28,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: reduceMotion
              ? 0
              : 0.7,
            delay: reduceMotion
              ? 0
              : 0.14,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="min-w-0"
        >
          <Card
            className="
              min-w-0 gap-0 rounded-[10px]
              bg-surface-elevated
              py-0 shadow-card
            "
          >
            <CardHeader
              className="
                pt-[30px]
                text-center
                sm:px-7
              "
            >
              <CardTitle
                className="
                  text-[20px] font-bold
                  leading-[1.45]
                  text-heading-secondary
                "
              >
                {content.simulationPage.formTitle}
              </CardTitle>
            </CardHeader>

            <CardContent
              className="
                px-6 pb-[30px]
                sm:px-7
              "
            >
              <form
                noValidate
                onSubmit={handleSubmit}
                className="space-y-[22px]"
              >
                <div>
                  <label
                    htmlFor="daily-premium"
                    className="sr-only"
                  >
                    {content.simulationPage.premiumLabel}
                  </label>

                  <Input
                    id="daily-premium"
                    type="number"
                    inputMode="numeric"
                    min={MINIMUM_DAILY_PREMIUM}
                    step="1"
                    value={premium}
                    onChange={(event) =>
                      setPremium(
                        event.target.value,
                      )
                    }
                    placeholder={
                      content.simulationPage.premiumLabel
                    }
                    aria-invalid={
                      Boolean(
                        errors.premium,
                      )
                    }
                    aria-describedby={
                      errors.premium
                        ? "premium-error"
                        : undefined
                    }
                    className="
                      h-[51px]
                      rounded-none
                      border-0 border-b
                      border-border-strong
                      bg-transparent
                      px-3
                      text-[16px]
                      text-text
                      shadow-none
                      transition-[border-color,box-shadow]
                      duration-500
                      placeholder:text-text-muted
                      focus-visible:border-brand
                      focus-visible:ring-0
                    "
                  />

                  {errors.premium && (
                    <p
                      id="premium-error"
                      role="alert"
                      className="
                        mt-2 px-3
                        text-[12px]
                        text-destructive
                      "
                    >
                      {errors.premium}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="contract-duration"
                    className="sr-only"
                  >
                    {content.simulationPage.durationLabel}
                  </label>

                  <Input
                    id="contract-duration"
                    type="number"
                    inputMode="numeric"
                    min="1"
                    step="1"
                    value={duration}
                    onChange={(event) =>
                      setDuration(
                        event.target.value,
                      )
                    }
                    placeholder={
                      content.simulationPage.durationLabel
                    }
                    aria-invalid={
                      Boolean(
                        errors.duration,
                      )
                    }
                    aria-describedby={
                      errors.duration
                        ? "duration-error"
                        : undefined
                    }
                    className="
                      h-[51px]
                      rounded-none
                      border-0 border-b
                      border-border-strong
                      bg-transparent
                      px-3
                      text-[16px]
                      text-text
                      shadow-none
                      transition-[border-color,box-shadow]
                      duration-500
                      placeholder:text-text-muted
                      focus-visible:border-brand
                      focus-visible:ring-0
                    "
                  />

                  {errors.duration && (
                    <p
                      id="duration-error"
                      role="alert"
                      className="
                        mt-2 px-3
                        text-[12px]
                        text-destructive
                      "
                    >
                      {errors.duration}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="
                    h-[50px] w-full
                    rounded-[4px]
                    bg-brand
                    text-[15px] font-bold
                    uppercase
                    text-brand-contrast
                    shadow-card
                    transition-[background-color,box-shadow,transform]
                    duration-500
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    hover:-translate-y-0.5
                    hover:bg-brand-hover
                    hover:shadow-card-hover
                  "
                >
                  {content.simulationPage.simulate}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={
            reduceMotion
              ? false
              : {
                  opacity: 0,
                  x: 28,
                }
          }
          animate={{
            opacity: 1,
            x: 0,
          }}
          transition={{
            duration: reduceMotion
              ? 0
              : 0.7,
            delay: reduceMotion
              ? 0
              : 0.18,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="min-w-0"
        >
          <Card
            className="
              min-w-0 gap-0 rounded-[10px]
              bg-surface-elevated
              py-0 shadow-card
            "
          >
            <CardHeader
              className="
                flex flex-col
                items-start justify-between
                gap-4
                px-6 py-[24px]
                sm:flex-row sm:items-center
                sm:px-7
              "
            >
              <CardTitle
                className="
                  text-[19px] font-bold
                  text-heading-secondary
                  sm:text-[20px]
                "
              >
                {content.simulationPage.resultTitle}
              </CardTitle>

              {result && (
                <Button
                  asChild
                  className="
                    h-[48px] w-full shrink-0
                    rounded-[4px]
                    bg-brand
                    px-[24px]
                    text-[14px] font-bold
                    uppercase
                    text-brand-contrast
                    shadow-card
                    transition-[background-color,box-shadow,transform]
                    duration-500
                    ease-[cubic-bezier(0.22,1,0.36,1)]
                    hover:-translate-y-0.5
                    hover:bg-brand-hover
                    hover:shadow-card-hover
                    sm:w-auto
                  "
                >
                  <Link href="/#assistance">
                    {content.simulationPage.subscribe}
                  </Link>
                </Button>
              )}
            </CardHeader>

            <AnimatePresence initial={false}>
              {result && (
                <motion.div
                  key="simulation-result"
                  initial={
                    reduceMotion
                      ? false
                      : {
                          opacity: 0,
                          y: 18,
                        }
                  }
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  exit={{
                    opacity: 0,
                    y: 12,
                  }}
                  transition={{
                    duration: reduceMotion
                      ? 0
                      : 0.55,
                    ease: [
                      0.22,
                      1,
                      0.36,
                      1,
                    ],
                  }}
                >
                  <CardContent
                    className="
                      min-w-0
                      border-t border-border
                      px-5 pb-6 pt-6
                      sm:px-7
                    "
                  >
                    <div
                      className="
                        grid gap-4
                        sm:grid-cols-2
                      "
                    >
                      <div
                        className="
                          rounded-[12px]
                          bg-brand-soft
                          p-5
                        "
                      >
                        <p
                          className="
                            text-[13px]
                            font-medium
                            text-text-muted
                          "
                        >
                          {content.simulationPage.totalContribution}
                        </p>

                        <p
                          className="
                            mt-2
                            text-[22px] font-bold
                            text-heading
                          "
                        >
                          {formatCurrency(
                            result.totalContribution,
                          )}
                        </p>
                      </div>

                      <div
                        className="
                          rounded-[12px]
                          bg-brand-soft
                          p-5
                        "
                      >
                        <p
                          className="
                            text-[13px]
                            font-medium
                            text-text-muted
                          "
                        >
                          {content.simulationPage.terminalValue}
                        </p>

                        <p
                          className="
                            mt-2
                            text-[22px] font-bold
                            text-heading
                          "
                        >
                          {formatCurrency(
                            result.terminalSurrenderValue,
                          )}
                        </p>
                      </div>
                    </div>

                    <div
                      className="
                        mt-6 min-w-0 overflow-hidden
                        rounded-[12px]
                        border border-border
                      "
                    >
                      <Table className="min-w-[680px]">
                        <TableHeader
                          className="bg-brand"
                        >
                          <TableRow
                            className="
                              border-brand
                              hover:bg-brand
                            "
                          >
                            <TableHead className="text-brand-contrast">
                              {content.simulationPage.table.id}
                            </TableHead>

                            <TableHead className="text-brand-contrast">
                              {content.simulationPage.table.year}
                            </TableHead>

                            <TableHead className="text-right text-brand-contrast">
                              {content.simulationPage.table.contribution}
                            </TableHead>

                            <TableHead className="text-right text-brand-contrast">
                              {content.simulationPage.table.surrenderValue}
                            </TableHead>

                            <TableHead className="text-center text-brand-contrast">
                              {content.simulationPage.table.rate}
                            </TableHead>
                          </TableRow>
                        </TableHeader>

                        <TableBody>
                          {result.rows.map(
                            (row) => (
                              <TableRow
                                key={row.id}
                                className="
                                  transition-colors
                                  duration-500
                                  hover:bg-brand-soft/70
                                "
                              >
                                <TableCell className="font-semibold">
                                  {row.id}
                                </TableCell>

                                <TableCell>
                                  {dateFormatter.format(
                                    row.date,
                                  )}
                                </TableCell>

                                <TableCell className="text-right">
                                  {formatCurrency(
                                    row.contribution,
                                  )}
                                </TableCell>

                                <TableCell className="text-right font-semibold text-heading">
                                  {formatCurrency(
                                    row.surrenderValue,
                                  )}
                                </TableCell>

                                <TableCell className="text-center">
                                  {row.rate}
                                </TableCell>
                              </TableRow>
                            ),
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </div>
    </main>
  );
}
