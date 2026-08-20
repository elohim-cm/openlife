import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import type {FaqItem as FaqItemType,} from "./faq.data";

type FaqItemProps = {item: FaqItemType;};

export function FaqItem({item,}: FaqItemProps) {
  return (
    <AccordionItem value={item.id} className="
        overflow-hidden
        rounded-[16px]
        border border-border
        bg-surface-elevated
        shadow-[0_4px_15px_rgba(0,0,0,0.08)]
        transition-[border-color,box-shadow,transform]
        duration-300
        data-[state=open]:border-2
        data-[state=open]:border-border-brand
        data-[state=open]:shadow-card-hover
      "
    >
      <AccordionTrigger className="min-h-[72px] gap-4 px-[18px] py-4">
        <span className="flex min-w-0 flex-1 items-center gap-[14px] sm:gap-[16px]">
          <span aria-hidden="true" className="
              flex size-[30px]
              shrink-0 items-center
              justify-center rounded-full
              bg-brand
              text-[13px] font-bold
              text-brand-contrast
              shadow-[0_3px_8px_rgba(23,107,12,0.28)]
              transition-transform
              duration-300
              group-data-[state=open]:scale-105
            "
          >{item.number}</span>

          <span className="
              min-w-0
              text-[12px] font-bold
              leading-[1.45]
              text-text-muted
              transition-colors
              duration-300
              group-hover:text-brand
              group-data-[state=open]:text-brand
              sm:text-[13px]
              lg:text-[14px]
            "
          >{item.question}</span>
        </span>

        <span aria-hidden="true" className="
            relative flex size-[31px]
            shrink-0 items-center
            justify-center rounded-full
            bg-brand
            shadow-[0_3px_8px_rgba(23,107,12,0.30)]
            transition-[background-color,transform]
            duration-300
            group-hover:scale-105
            group-data-[state=open]:rotate-180
            group-data-[state=open]:bg-cta
          "
        >
          <span
            className="
              absolute h-[2px]
              w-[13px]
              rounded-full
              bg-white
            "
          />

          <span
            className="
              absolute h-[13px]
              w-[2px]
              rounded-full
              bg-white
              transition-[transform,opacity]
              duration-300
              group-data-[state=open]:rotate-90
              group-data-[state=open]:opacity-0
            "
          />
        </span>
      </AccordionTrigger>

      <AccordionContent>
        <div
          className="
            border-t border-border
            px-[18px] pb-[24px]
            pt-[19px]
            sm:px-[68px]
            sm:pb-[28px]
            sm:pt-[22px]
          "
        >
          <p
            className="
              max-w-[1250px]
              text-[14px]
              leading-[1.8]
              text-text-muted
              sm:text-[15px]
              lg:text-[16px]
            "
          >
            {item.answer}
          </p>

          {item.details && (<ul
              className="
                mt-4 space-y-2
                text-[14px]
                text-text-muted
                sm:text-[15px]
              "
            >
              {item.details.map((detail) => (
                <li key={detail} className=" flex items-start gap-[10px] ">
                  <span aria-hidden="true" className=" mt-[9px] size-[6px] shrink-0 rounded-full bg-brand "/>
                  <span className="leading-[1.65]">{detail}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}