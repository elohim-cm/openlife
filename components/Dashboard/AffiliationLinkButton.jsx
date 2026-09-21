"use client";

import React, {useState, useMemo} from "react";
import {Box, Button, IconButton, Paper, Snackbar, Tooltip, Typography} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ShareIcon from "@mui/icons-material/Share";
import LinkIcon from "@mui/icons-material/Link";
import CloseIcon from "@mui/icons-material/Close";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";

const AffiliationLinkButton = () => {
  const {t} = useTranslation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const providerCode = useMemo(() => UtilMethods.getAuthCode(), []);

  const affiliationLink = useMemo(() => {
    if (typeof window === "undefined" || !providerCode) return "";
    return `${window.location.origin}/simuler?ref=${providerCode}`;
  }, [providerCode]);

  if (!providerCode) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(affiliationLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Failed to copy link:", e);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: t("affiliationLinkShareTitle"),
          text: t("affiliationLinkShareText"),
          url: affiliationLink,
        });
      } catch (e) {
        console.error("Share failed:", e);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <Box
        sx={{
          position: "sticky",
          top: 85,
          zIndex: 1000,
          display: "flex",
          justifyContent: "flex-end",
          mb: 2,
        }}
      >
        <Paper
          elevation={3}
          sx={{
            borderRadius: 2,
            overflow: "hidden",
            maxWidth: open ? 480 : "auto",
            transition: "max-width 0.3s ease",
          }}
        >
          {!open ? (
            <Button
              variant="contained"
              color="primary"
              startIcon={<LinkIcon />}
              onClick={() => setOpen(true)}
              sx={{borderRadius: 2, textTransform: "none"}}
            >
              {t("affiliationLink")}
            </Button>
          ) : (
            <Box sx={{p: 2}}>
              <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1}}>
                <Typography variant="subtitle2" sx={{fontWeight: 600, color: "primary.main"}}>
                  {t("affiliationLink")}
                </Typography>
                <IconButton size="small" onClick={() => setOpen(false)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  bgcolor: "grey.100",
                  borderRadius: 1,
                  px: 1.5,
                  py: 1,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    flex: 1,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {affiliationLink}
                </Typography>
                <Tooltip title={copied ? t("copied") : t("copy")}>
                  <IconButton size="small" onClick={handleCopy} color={copied ? "success" : "primary"}>
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
                <Tooltip title={t("share")}>
                  <IconButton size="small" onClick={handleShare} color="primary">
                    <ShareIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
              <Typography variant="caption" sx={{display: "block", mt: 0.5, color: "text.secondary"}}>
                {t("affiliationLinkHint")}
              </Typography>
            </Box>
          )}
        </Paper>
      </Box>
      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        message={t("linkCopied")}
        anchorOrigin={{vertical: "bottom", horizontal: "center"}}
      />
    </>
  );
};

export default AffiliationLinkButton;
