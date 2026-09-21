"use client";

import React from "react";
import {Alert, AlertTitle, Box, Button} from "@mui/material";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import Routes from "@/utils/routes";

/**
 * Bannière persistante affichée pendant le délai de grâce de configuration
 * de la 2FA. Volontairement non refermable : elle doit rester visible tant
 * que le compte n'est pas conforme (voir point "notification persistante"
 * du cahier des charges).
 */
export default function TwoFactorGraceBanner({compliance}) {
  const {t} = useTranslation();
  const router = useRouter();

  return (
    <Box sx={{px: 2, pt: 2}}>
      <Alert
        severity="warning"
        variant="filled"
        action={
          <Button color="inherit" size="small" variant="outlined" onClick={() => router.push(Routes.PROFIL ?? "/profil")}>
            {t("Configure my 2FA")}
          </Button>
        }>
        <AlertTitle>{t("Two-factor authentication required")}</AlertTitle>
        {compliance.message}
      </Alert>
    </Box>
  );
}
