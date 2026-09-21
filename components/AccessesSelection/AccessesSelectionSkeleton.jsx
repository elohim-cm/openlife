"use client";

import Skeleton from "@mui/material/Skeleton";
import {useTranslation} from "react-i18next";
import styles from "@/styles/access-selection.module.scss";

const AccessesSelectionSkeleton = () => {
  const {t} = useTranslation();

  return (
    <section className={styles.content} aria-label={t("accessSelection.loading")}>
      <div className={styles.intro}>
        <div className={styles.skeletonIntro}>
          <Skeleton variant="rounded" width={132} height={26} />
          <Skeleton variant="text" width={190} height={28} />
          <Skeleton variant="text" width="min(520px, 82vw)" height={54} />
          <Skeleton variant="text" width="min(620px, 86vw)" height={28} />
        </div>
      </div>
      <div className={styles.grid}>
        {[0, 1, 2].map(item => <Skeleton key={item} variant="rounded" className={styles.skeletonCard} />)}
      </div>
    </section>
  );
};

export default AccessesSelectionSkeleton;
