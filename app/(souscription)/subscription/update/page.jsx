"use client";

import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import Image from "next/image";
import SousHeader from "@/components/souscription/SousHeader";
import {Box, Typography} from "@mui/material";
import SouscriptionForm from "@/components/souscription/SouscriptionForm";
import React, {useCallback, useEffect, useRef} from "react";
import {getToken, getUid, jsonToFormData} from "@/utils";
import {sous_img2} from "@/utils/assets/assets";
import {useRouter} from "next/navigation";
import SubscriptionService from "@/services/SubscriptionService";
import {canInterprateError, displayHttpError} from "@/utils/api";
import "@/styles/flex.scss";
import "@/styles/souscription.scss";
import Toast from "@/utils/toast";
import Routes from "@/utils/routes";
import {useTranslation} from "react-i18next";

const SouscriptionUpdatePage = () => {
  const {t} = useTranslation();
  const [sideImage, setSideImage] = React.useState(sous_img2);
  const [pageLoading, setPageLoading] = React.useState(false);
  const [record, setRecord] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const router = useRouter();
  const token = getToken();
  const formRef = useRef(null);

  const getRecord = useCallback(async () => {
    const uid = getUid();
    const result = await SubscriptionService.show(token, uid);
    if (result.error == null) {
      setRecord(result.data);
    } else {
      displayHttpError(result.error, router);
    }
    setReady(true);
  }, [router, token]);

  useEffect(() => {
    getRecord();
  }, [getRecord]);

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

  const handleSubmit = async _data => {
    formRef.current.showLoader();
    const uid = getUid();
    // const data = jsonToFormData(_data);
    console.log("Preparing to put data::: ", _data);
    const result = await SubscriptionService.update(token, uid, _data);
    let resultCni = {error: null};
    if (_data.scan_cni) {
      resultCni = await SubscriptionService.updateCni(token, uid, jsonToFormData({scan_cni: _data.scan_cni}));
    }
    if (!result.error) {
      if (resultCni.error == null) {
        setPageLoading(true);
        Toast.success(t("subscriptionSavedSuccessfully"));
        router.push(Routes.SOUSCRIPTION_LIST);
      } else {
        displayHttpError(resultCni.error, router);
      }
    } else {
      displayHttpError(result.error, router);
    }
    formRef.current.hideLoader();
  };

  const handleSubscribe = async _data => {
    formRef.current.showLoader();
    const uid = getUid();
    const data = jsonToFormData(_data);
    const result = await SubscriptionService.sendCode(uid);
    if (!result.error) {
      setPageLoading(true);
      Toast.success(t("subscriptionSavedSuccessfully"));
      router.push(
        Routes.withParams(Routes.SOUS_CONFIRM, [
          {label: "subscription", value: uid},
          {label: "prime", value: _data.prime},
        ]),
      );
    } else {
      displayHttpError(result.error, router);
    }
    formRef.current.hideLoader();
  };

  return (
    <div className="sous-container">
      <PageLoadingIndicator visible={pageLoading} />
      <div className="sous-bg-container">
        <div className="sous-side-image">
          <Image alt="#" src={sideImage} fill={true} objectFit="cover" />
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
          <Typography variant="h3">{t("subscription")}</Typography>
          <Box sx={{mt: 5}}>
            <SouscriptionForm
              ref={formRef}
              token={token}
              changeSideImage={_img => {
                setSideImage(_img);
              }}
              data={record}
              updating={true}
              parentReady={ready}
              onSubmit={handleSubmit}
              onSubscribe={handleSubscribe}
            />
          </Box>
        </div>
      </div>
    </div>
  );
};

export default SouscriptionUpdatePage;
