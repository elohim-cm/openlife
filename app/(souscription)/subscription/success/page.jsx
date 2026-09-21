"use client";
import React from "react";
import "@/styles/flex.scss";
import "@/styles/souscription.scss";
import {useRouter} from "next/navigation";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import Image from "next/image";
import SousHeader from "@/components/souscription/SousHeader";
import {Button, Typography} from "@mui/material";
import sous_success from "@/public/images/sous-success.svg";
import Routes from "@/utils/routes";
import {getToken} from "@/utils";
import {useTranslation} from "react-i18next";

const SousSuccessPage = () => {
  const {t} = useTranslation();
  const [pageLoading, setPageLoading] = React.useState(false);
  const router = useRouter();
  const token = getToken();

  const handleScroll = e => {
    let header = document.querySelector(".sous-header");
    console.log("Scroll::: ", e.target.scrollTop, header);
    if (header) {
      if (e.target.scrollTop > 40) {
        header.className = header.className.replace("fixed", "");
        header.className += " fixed";
      } else {
        header.className = header.className.replace("fixed", "");
      }
    }
  };

  return (
    <div className="sous-container" style={{alignItems: "flex-start"}}>
      <PageLoadingIndicator visible={pageLoading} />
      <div className="sous-bg-container">
        <div className="__center">
          <div className="__center sous-success">
            <Typography variant="h4" sx={{mb: 4, textAlign: "center"}}>
              {t("operationInProgressPleaseVerifyOnYourMobilePhone")}
            </Typography>
            <Image alt="#" src={sous_success} width={135.938} height={135.938} />
            <Typography variant="h5" sx={{mt: 4, textAlign: "center"}}>
              {t("thankYouForChoosingOpenLife")}
            </Typography>
            {token && token != "" ? (
              <Button
                variant="contained"
                size="large"
                sx={{mt: 3}}
                onClick={() => {
                  setPageLoading(true);
                  router.push(Routes.SOUSCRIPTION_LIST);
                }}>
                {t("listOfSubscriptions")}
              </Button>
            ) : (
              <Button
                variant="contained"
                size="large"
                sx={{mt: 3}}
                onClick={() => {
                  setPageLoading(true);
                  router.push(Routes.LOGIN);
                }}>
                {t("logInToMyAccount")}
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="sous-real-container" onScroll={handleScroll} style={{height: "auto"}}>
        <SousHeader
          onBack={() => {
            router.push(Routes.SIMULER);
            setPageLoading(true);
          }}>
          {t("simulate")}
        </SousHeader>
      </div>
    </div>
  );
};

export default SousSuccessPage;
