import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export type FaqPageEntry = {
  id: string;
  question: string;
  answer: string;
};

type FaqPageItemProps = {
  item: FaqPageEntry;
  number: number;
};

export function FaqPageItem({
  item,
  number,
}: FaqPageItemProps) {
  return (
    <AccordionItem
      value={item.id}
      className="
        overflow-hidden
        rounded-[15px]
        border border-border
        bg-surface-elevated
        shadow-[0_5px_18px_rgb(22_77_12_/_8%)]
        transition-[border-color,box-shadow,transform]
        duration-500
        ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-0.5
        hover:border-border-brand
        hover:shadow-card-hover
        data-[state=open]:border-border-brand
        data-[state=open]:shadow-card-hover
      "
    >
      <AccordionTrigger
        className="
          min-h-[68px]
          gap-4
          px-[18px] py-[14px]
          sm:min-h-[72px]
          sm:px-[22px]
          lg:px-[25px]
        "
      >
        <span
          className="
            flex min-w-0 flex-1
            items-center
            gap-[14px]
            sm:gap-[17px]
          "
        >
          <span
            aria-hidden="true"
            className="
              flex size-[31px]
              shrink-0 items-center
              justify-center rounded-full
              bg-brand
              text-[12px] font-bold
              text-brand-contrast
              shadow-[0_3px_9px_rgb(23_107_12_/_28%)]
              transition-transform
              duration-500
              ease-[cubic-bezier(0.22,1,0.36,1)]
              group-hover:scale-105
              group-data-[state=open]:scale-105
              sm:size-[34px]
              sm:text-[13px]
            "
          >
            {number}
          </span>

          <span
            className="
              min-w-0
              text-left
              text-[13px] font-semibold
              leading-[1.5]
              text-text-muted
              transition-colors
              duration-500
              group-hover:text-brand
              group-data-[state=open]:text-brand
              sm:text-[14px]
              lg:text-[15px]
            "
          >
            {item.question}
          </span>
        </span>

        <span
          aria-hidden="true"
          className="
            relative flex size-[31px]
            shrink-0 items-center
            justify-center rounded-full
            bg-brand
            shadow-[0_3px_9px_rgb(23_107_12_/_30%)]
            transition-[background-color,transform,box-shadow]
            duration-500
            ease-[cubic-bezier(0.22,1,0.36,1)]
            group-hover:scale-105
            group-data-[state=open]:rotate-180
            group-data-[state=open]:bg-cta
            sm:size-[34px]
          "
        >
          <span
            className="
              absolute h-[2px]
              w-[13px]
              rounded-full bg-white
            "
          />

          <span
            className="
              absolute h-[13px]
              w-[2px]
              rounded-full bg-white
              transition-[opacity,transform]
              duration-500
              ease-[cubic-bezier(0.22,1,0.36,1)]
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
            px-[63px] pb-[22px]
            pt-[17px]
            sm:px-[73px]
            sm:pb-[25px]
            lg:px-[82px]
          "
        >
          <p
            className="
              max-w-[1250px]
              text-[13px]
              leading-[1.75]
              text-text-muted
              sm:text-[14px]
              lg:text-[15px]
            "
          >
            {item.answer}
          </p>
        </div>
      </AccordionContent>
    </AccordionItem>
  );
}