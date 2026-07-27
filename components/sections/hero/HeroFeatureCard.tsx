import type { IconType } from "react-icons";

type HeroFeatureCardProps = {
  icon: IconType;
  label: string;
};

export function HeroFeatureCard({
  icon: Icon,
  label,
}: HeroFeatureCardProps) {
  return (
    <div
      className="
        flex h-[49px] items-center gap-[13px]
        rounded-[11px] border border-border-brand
        bg-surface/30 px-[22px]
        text-[#343434]
        backdrop-blur-[2px]
        transition-[background-color,border-color,transform]
        duration-200 ease-out
        hover:-translate-y-0.5
        hover:border-[#8cad81]
        hover:bg-surface/50
      "
    >
      <Icon
        aria-hidden="true"
        className="size-[19px] shrink-0 text-[#176809]"
      />

      <span className="whitespace-nowrap text-[14px] font-medium leading-none">
        {label}
      </span>
    </div>
  );
}