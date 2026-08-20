import {
  LockKeyhole,
  ShieldCheck,
  Star,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import {
  useSiteContent,
} from "@/hooks/useSiteContent";

const TRUST_ICONS:
  Record<string, LucideIcon> = {
    approval: ShieldCheck,
    security: LockKeyhole,
    savers: UsersRound,
    rating: Star,
  };

export function HeroTrustBar() {
  const content = useSiteContent();

  return (
    <div
      className="
        mx-auto grid w-full
        max-w-[1295px]
        grid-cols-2
        rounded-[16px]
        border
        border-[var(--hero-trust-border)]
        bg-[var(--hero-trust-background)]
        px-5 py-5
        shadow-[var(--hero-trust-shadow)]
        backdrop-blur-[10px]
        lg:grid-cols-4
        lg:px-8
      "
    >
      {content.hero.trustItems.map(
        (item, index) => {
          const Icon =
            TRUST_ICONS[item.id];

          if (!Icon) {
            return null;
          }

          return (
            <div
              key={item.id}
              className={`
                flex min-h-[58px]
                items-center gap-4
                px-2 py-2
                sm:px-5
                lg:justify-center
                ${
                  index % 2 === 1
                    ? "border-l border-[var(--hero-trust-divider)]"
                    : ""
                }
                ${
                  index > 0
                    ? "lg:border-l lg:border-[var(--hero-trust-divider)]"
                    : "lg:border-l-0"
                }
              `}
            >
              <Icon
                aria-hidden="true"
                className="
                  size-[31px]
                  shrink-0
                  text-brand
                "
                strokeWidth={1.9}
              />

              <p
                className="
                  text-[12px]
                  leading-[1.4]
                  text-text-muted
                  sm:text-[13px]
                "
              >
                <span
                  className="
                    block font-medium
                    text-heading-secondary
                  "
                >
                  {item.title}
                </span>

                <span className="block">
                  {item.description}
                </span>
              </p>
            </div>
          );
        },
      )}
    </div>
  );
}
