"use client";

import React from "react";
import {Box, Button, Card, CardContent, Stack, Typography} from "@mui/material";
import LockPersonIcon from "@mui/icons-material/LockPerson";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import Routes from "@/utils/routes";

/**
 * Écran plein cadre qui remplace le contenu du tableau de bord lorsque le
 * délai de grâce de configuration de la 2FA est dépassé (ou qu'un
 * administrateur a exigé une reconfiguration). Rendu par
 * TwoFactorEnforcementGate à la place de {children} sur toutes les routes du
 * dashboard sauf la page de profil, qui reste seule accessible pour que
 * l'utilisateur puisse effectivement configurer sa 2FA et lever le blocage.
 */
export default function TwoFactorLockScreen({compliance}) {
  const {t} = useTranslation();
  const router = useRouter();

  const isSuspended = compliance.status === "suspended";

  return (
    <Box
      sx={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}>
      <Card sx={{maxWidth: 480}} elevation={3}>
        <CardContent sx={{textAlign: "center", p: 4}}>
          <LockPersonIcon color="warning" sx={{fontSize: 56, mb: 2}} />
          <Typography variant="h5" gutterBottom>
            {isSuspended ? t("Two-factor reconfiguration required") : t("Two-factor authentication required")}
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{mb: 3}}>
            {compliance.message}
          </Typography>
          <Stack spacing={1} alignItems="center">
            <Button variant="contained" size="large" onClick={() => router.push(Routes.PROFIL ?? "/profil")}>
              {t("Configure my 2FA")}
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
