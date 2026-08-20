export type ExperienceItem = {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

export type ExperienceAsset = {
  id: string;
  imageSrc: string;
};

export const EXPERIENCE_ASSETS: readonly ExperienceAsset[] = [
    {
      id: "dashboard",
      imageSrc: "/images/experience/dashboard.png",
    },
    {
      id: "subscription",
      imageSrc:"/images/experience/subscription.png",
    },
    {
      id: "simulation",
      imageSrc:"/images/experience/simulation.png",
    },
    {
      id: "collection",
      imageSrc:"/images/experience/collection.png",
    },
    {
      id: "redemption",
      imageSrc:
        "/images/experience/redemption.png",
    },
  ] as const;