"use client";

import React, {useEffect} from "react";
import {sous_img2} from "@/utils/assets/assets";
import Image from "next/image";
import SousHeader from "@/components/souscription/SousHeader";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {useRouter} from "next/navigation";
import {Box, Typography} from "@mui/material";
import SouscriptionForm from "@/components/souscription/SouscriptionForm";
import Routes from "@/utils/routes";
import SubscriptionService from "@/services/SubscriptionService";
import Toast from "@/utils/toast";
import {getToken, getUrlParams, jsonToFormData} from "@/utils";
import {canInterprateError} from "@/utils/api";
import "@/styles/flex.scss";
import "@/styles/souscription.scss";
import {useTranslation} from "react-i18next";
import AffiliationLogoutModal from "@/components/souscription/AffiliationLogoutModal";

const SouscriptionPage = () => {
  const {t} = useTranslation();
  const [sideImage, setSideImage] = React.useState(sous_img2);
  const [pageLoading, setPageLoading] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const router = useRouter();
  const [ok, setOk] = React.useState(false);
  const token = getToken();
  const formRef = React.useRef(null);

  React.useEffect(() => {
    const params = getUrlParams();
    const hasRef = params.some(p => p.label === "ref" && p.value);
    if (hasRef && token) {
      setShowLogoutModal(true);
    }
  }, []);

  const handlePopstate = event => {
    const leaveMessage = t("subscriptionLeaveConfirmation");
    const isOk = confirm(leaveMessage);
    if (isOk) {
      setOk(true);
      event.returnValue = true;
    }
    return leaveMessage;
  };

  const handleSubmit = async _data => {
    formRef.current.showLoader();
    const data = jsonToFormData(_data);
    const params = getUrlParams();
    const refParam = params.find(p => p.label === "ref");
    const providerCode = refParam?.value || null;
    console.log("Preparing to post data::: ", data);
    const result = await SubscriptionService.create(token, data, providerCode);
    if (!result.error) {
      setPageLoading(true);
      Toast.successKey("subscriptionSavedSuccessfully");
      if (_data.draft) {
        router.push(Routes.SOUSCRIPTION_LIST);
      } else {
        const confirmParams = [
          {label: "subscription", value: result.data.uid},
          {label: "prime", value: result.data.prime},
        ];
        if (providerCode) {
          confirmParams.push({label: "ref", value: providerCode});
        }
        router.push(Routes.withParams(Routes.SOUS_CONFIRM, confirmParams));
      }
    } else {
      if (canInterprateError(result.error)) {
        const reason = result.error.response?.data?.message;
        Toast.errorKey(
          reason ? "subscriptionSubmissionFailedWithReason" : "subscriptionSubmissionFailed",
          reason ? {reason} : undefined,
        );
      } else {
        Toast.errorKey("anErrorHasOccurred");
      }
    }
    formRef.current.hideLoader();
  };

  return (
    <div className="sous-container" data-simulation-header>
      <PageLoadingIndicator visible={pageLoading} />
      <div className="sous-bg-container">
        <div className="sous-side-image">
          <Image alt="#" src={sideImage} fill={true} objectFit="cover" />
        </div>
      </div>
      <div className="sous-scroll-controller">
        <div className="sous-real-container">
          <SousHeader
            onBack={() => {
              router.back();
              setPageLoading(true);
            }}
          />
          <Typography className="sous-welcome" sx={{mt: 4}}>{t("welcomeToOpenLife")}</Typography>
          <Typography variant="h3">{t("subscription")}</Typography>
          <Box sx={{mt: 5}}>
            <SouscriptionForm
              ref={formRef}
              token={token}
              changeSideImage={_img => {
                setSideImage(_img);
              }}
              onSubmit={handleSubmit}
            />
          </Box>
        </div>
      </div>
      <AffiliationLogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default SouscriptionPage;
