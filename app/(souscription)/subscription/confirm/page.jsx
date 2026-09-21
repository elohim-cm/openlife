"use client";

import React from "react";
import "@/styles/flex.scss";
import "@/styles/souscription.scss";
import {sous_img1} from "@/utils/assets/assets";
import Image from "next/image";
import SousHeader from "@/components/souscription/SousHeader";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {useRouter} from "next/navigation";
import {Box, Typography} from "@mui/material";
import SousConfirm from "@/components/souscription/confirm/SousConfirm";
import Routes from "@/utils/routes";
import {getToken} from "@/utils";
import {useTranslation} from "react-i18next";

const SousConfirmPage = () => {
  const {t} = useTranslation();
  const [sideImage, setSideImage] = React.useState(sous_img1);
  const [pageLoading, setPageLoading] = React.useState(false);
  const router = useRouter();
  const token = getToken();

  const handleScroll = e => {
    let header = document.querySelector(".sous-header");
    if (header) {
      if (e.target.scrollTop > 34) {
        if (header.className.indexOf("fixed") === -1 && e.target.scrollHeight - e.target.offsetHeight > 150) {
          header.className += " fixed";
        }
      } else {
        header.className = header.className.replace("fixed", "");
      }
    }
  };

  const handleSubmit = _data => {
    setPageLoading(true);
    router.push(Routes.SOUS_SUCCESS);
  };

  return (
    <div className="sous-container" data-simulation-header>
      <PageLoadingIndicator visible={pageLoading} />
      <div className="sous-bg-container">
        <div className="sous-side-image">
          <Image alt={t("subscriptionConfirmationImageAlt")} src={sideImage} fill={true} objectFit="cover" />
        </div>
      </div>
      <div className="sous-scroll-controller" onScroll={handleScroll}>
        <div className="sous-real-container">
          <SousHeader
            onBack={() => {
              router.back();
              setPageLoading(true);
            }}
          />
          <Typography sx={{mt: 4}}>{t("welcomeToOpenLife")}</Typography>
          <Typography variant="h3">{t("subscriber")}</Typography>
          <Box sx={{mt: 5}}>
            <SousConfirm
              token={token}
              changeSideImage={_img => {
                setSideImage(_img);
              }}
              onSubmit={handleSubmit}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default SousConfirmPage;
