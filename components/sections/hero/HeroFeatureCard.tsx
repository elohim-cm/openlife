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
        bg-surface/30 px-5.5
        backdrop-blur-[2px]
        transition-[background-color,border-color,transform]
        duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]
        hover:-translate-y-1
        hover:border-[#8cad81]
        hover:bg-surface/50
      "
    >
      <Icon aria-hidden="true" className="size-4.75 shrink-0 text-[#176809]"/>

      <span className="whitespace-nowrap text-[14px] font-medium leading-none">
        {label}
      </span>
    </div>
  );
}