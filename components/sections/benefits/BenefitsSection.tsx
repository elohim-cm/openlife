"use client";

import {useMemo,} from "react";
import {useSiteContent,} from "@/hooks/useSiteContent";
import {BenefitCard,} from "./BenefitCard";
import {BENEFIT_DEFINITIONS,type Benefit,} from "./Benefits.data";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function BenefitsSection() {
  const content =useSiteContent();
  const benefits = useMemo<readonly Benefit[]>(() => {
      return BENEFIT_DEFINITIONS.map((definition,index,) => {
          const translatedItem =content.benefits.items[index];
          return {
            id:definition.id,
            icon:definition.icon,
            lines:translatedItem?.lines ?? [],
          };
        },
      );
    }, [content.benefits.items,]);

  return (
    <section id="openlife-benefits" data-section-after-hero aria-labelledby="openlife-benefits-title" className="bg-background" >
      <div className="
          mx-auto w-full
          max-w-[1500px]
          px-5 pb-[58px]
          pt-[62px]
          sm:px-8
          lg:px-10
          lg:pb-[58px]
          lg:pt-[60px]
        "
      >
        <p className="
            mx-auto
            max-w-[1450px]
            text-center
            text-[15px]
            font-normal
            leading-[1.65]
            text-text-muted
            sm:text-[17px]
            lg:text-[18px]
            lg:leading-[1.7]
          "
        >{content.benefits.introduction}</p>

        <h2 id="openlife-benefits-title" className="
            mt-[62px]
            flex items-center
            justify-center
            gap-[12px]
            text-center
            text-[20px]
            font-bold
            leading-tight
            text-heading
            sm:text-[22px]
          "
        >
          <span>{content.benefits.title}</span>
        </h2>

        <div className="
            mt-7.5
            grid grid-cols-1
            gap-6
            sm:grid-cols-2
            xl:grid-cols-4
            xl:gap-[25px]
          "
        >
          {benefits.map((benefit) => (
              <BenefitCard key={ benefit.id } benefit={benefit}/>
            ),
          )}
        </div>
      </div>

    </section>
  );
}