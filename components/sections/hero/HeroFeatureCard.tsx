import type {
  LucideIcon,
} from "lucide-react";

type HeroFeatureCardProps = {
  icon: LucideIcon;
  label: string;
};

export function HeroFeatureCard({
  icon: Icon,
  label,
}: HeroFeatureCardProps) {
  return (
    <div
      className="
        group flex
        items-center gap-4
      "
    >
      <span
        className="
          flex size-[49px]
          shrink-0
          items-center
          justify-center
          rounded-[11px]
          border
          border-[var(--hero-feature-border)]
          bg-[var(--hero-feature-background)]
          text-brand
          transition-[transform,border-color,background-color]
          duration-500
          ease-[cubic-bezier(0.16,1,0.3,1)]
          group-hover:-translate-y-0.5
          group-hover:border-brand/35
          group-hover:bg-brand-soft
        "
      >
        <Icon
          aria-hidden="true"
          className="size-[22px]"
          strokeWidth={2}
        />
      </span>

      <span
        className="
          text-[16px]
          font-medium
          leading-[1.35]
          text-heading-secondary
          sm:text-[17px]
        "
      >
        {label}
      </span>
    </div>
  );
}