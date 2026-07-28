import type {Benefit,} from "./Benefits.data";

type BenefitCardProps = {benefit: Benefit;};

export function BenefitCard({benefit,}: BenefitCardProps) {
  const Icon =benefit.icon;

  return (
    <article className="
        group relative flex
        min-h-[252px] w-full
        flex-col items-center
        rounded-[18px]
        border border-border
        bg-surface-elevated
        px-6 pb-8 pt-[143px]
        text-center
        shadow-card
        transition-[transform,box-shadow,border-color]
        duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-1
        hover:border-border-brand
        hover:shadow-card-hover
      "
    >
      <div className="
          absolute left-1/2
          top-[27px]
          flex size-[96px]
          -translate-x-1/2
          items-center
          justify-center
          rounded-full
          border-[3px]
          border-[#d7ebcf]
          bg-[linear-gradient(145deg,#ed1808_0%,#ff4d1c_100%)]
          text-[#ffc1a8]
          shadow-button
          transition-transform
          duration-300
          ease-[cubic-bezier(0.22,1,0.36,1)]
          group-hover:scale-[1.04]
        "
      >
        <Icon aria-hidden="true" className=" size-[23px] stroke-[1.2]" />
      </div>

      <div className=" flex flex-col items-center">
        {benefit.lines.map((line,index,) => (
            <p key={`${benefit.id}-${index}`} className={ line.highlighted ? "mt-[3px] text-[18px] font-bold leading-[1.35] text-brand" : "text-[16px] font-normal leading-[1.55] text-text"}>{line.text}</p>
          ),
        )}
      </div>
    </article>
  );
}