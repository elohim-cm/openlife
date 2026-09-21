import React, {useCallback, useEffect, useRef, useState} from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Button, Paper, Typography} from "@mui/material";
import {getToken, getUid, jsonToFormData} from "@/utils";
import Toast from "@/utils/toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import {useRouter} from "next/navigation";
import ContractService from "@/services/ContractService";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import "./styles/contract.module.scss";
import {canInterprateError, displayHttpError} from "@/utils/api";
import toast from "@/utils/toast";
import {CONTRACT_LIST} from "@/utils/routes/routes";
import {useTranslation} from "react-i18next";
import SouscriptionForm from "@/components/souscription/SouscriptionForm";
import UtilMethods from "@/utils/UtilMethods";
import SubscriptionService from "@/services/SubscriptionService";
import TwoFAModal from "@/components/TwoFAModal";

const statuses = t => [
  {label: t("processing"), value: "processing"},
  {label: t("suspended"), value: "suspended"},
  {label: t("echus"), value: "fence"},
  {label: t("expires"), value: "expired"},
];

const ContractUpdate = () => {
  const {t} = useTranslation();
  const [contract, setContract] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [inProgress, setInProgress] = useState(false);
  const [affiliations, setAffiliations] = useState(null);
  const [maritalStatuses, setMaritalStatuses] = useState(null);
  const [genders, setGenders] = useState(null);
  const context = useAppContext();
  const router = useRouter();
  const token = getToken();
  const formRef = useRef(null);
  const twoFaRef = useRef(null);

  // get the contract to be modified
  const getContract = useCallback(async () => {
    const {contract, error} = await ContractService.getOne(token, getUid());

    console.log("Contract update -- get one -- response ", contract);

    if (error === null) {
      setContract(contract);
      localStorage.setItem("contract", contract?.status);
    } else {
      Toast.show(t("anErrorHasOccurredPleaseRefreshThePage"), 3000, "error");
    }
  }, [token]);

  // get all affiliations
  const getAffiliations = useCallback(async () => {
    const response = await ContractService.getAffiliations();

    if (response.error === null) {
      setAffiliations(response.affiliations);
    } else {
      Toast.show(t("anErrorHasOccurredPleaseRefreshThePage"), 3000, "error");
    }
  }, [token]);

  // get all marital statuses
  const getSituations = useCallback(async () => {
    const response = await ContractService.getMaritalStatuses();

    if (response.error === null) {
      setMaritalStatuses(response.situations);
    } else {
      Toast.show(t("anErrorHasOccurredPleaseRefreshThePage"), 3000, "error");
    }
  }, [token]);

  // get all marital statuses
  const getGenders = useCallback(async () => {
    const response = await ContractService.getGenders();

    if (response.error === null) {
      setGenders(response.genders);
    } else {
      Toast.show(t("anErrorHasOccurredPleaseRefreshThePage"), 3000, "error");
    }
  }, [token]);

  useEffect(
    () => {
      getAffiliations();
      getSituations();
      getGenders();
      getContract();
    },
    [getAffiliations, getSituations, getGenders],
    getContract,
  );

  // submit data
  const onSubmit = async (_data, _otp = null) => {
    setInProgress(true);
    formRef.current.showLoader();
    console.log("ON CONTRACT FORM");

    const validated = await validateForm(_data);
    if (!validated) {
      return;
    }

    let resultCni = {error: null};
    if (_data.scan_cni) {
      resultCni = await SubscriptionService.updateCni(
        token,
        contract.subscription.uid,
        jsonToFormData({scan_cni: _data.scan_cni}),
      );
    }

    let response;
    delete _data.scan_cni;
    if (!UtilMethods.isSubscriber()) response = await ContractService.update(token, getUid(), _data, _otp);
    else response = await ContractService.amendment(token, getUid(), _data);

    twoFaRef.current.toggleLoader(false);
    if(response.error && response.error.response.status === 403 && response.error.response.data.two_step) {
      Toast.warn(response.error.response.data.message);
      setPendingData(_data);
      twoFaRef.current.open(response.error.response.data.data, "notif_infos", response.error.response.data.method, response.error.response.data.available_methods);
      return;
    }

    twoFaRef.current.close();
    if (response.error == null) {
      if (resultCni.error == null) {
        Toast.success(t("contractSuccessfullyUpdated"));

        router.push(CONTRACT_LIST);
      } else {
        displayHttpError(resultCni.error, router);
      }
    } else {
      if (canInterprateError(response.error, router)) {
        Toast.error(response.error.response.data.message);
      } else toast.show(t("anErrorHasOccurredPleaseRefreshThePage"), 3000, "error");
    }

    setInProgress(false);
    formRef.current.hideLoader();
  };

  const validateForm = async (_data) => {
    const result = await ContractService.validateUpdate(token, getUid(), _data);
    if (result.error == null) {
      return true;
    } else {
      displayHttpError(result.error, router);
    }
    setInProgress(false);
    formRef.current.hideLoader();
    return false;
  };

  return (
    <>
      {contract === null ? (
        <CreateFormSkeleton />
      ) : (
        <>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            color="secondary"
            onClick={e => {
              context.togglePageLoading(true);
              router.back();
            }}
            sx={{mb: 2}}>
            {t("back")}
          </Button>
          <Paper elevation={2} sx={{padding: "40px 24px", mb: 3}} className="brSm">
            <Typography variant="h5" component="h5" mb={2}>
              {t("updateContract")}
            </Typography>
            <ActivityIndicator visible={inProgress} />
            <SouscriptionForm
              ref={formRef}
              token={getToken()}
              changeSideImage={_img => {
                // setSideImage(_img);
              }}
              data={contract.subscription}
              dueDate={contract.due_date}
              _status={statuses(t).find(status => status.value === contract.status)}
              _statuses={statuses(t)}
              dataModifyBySubscriber={{
                prime: contract.prime,
                duration: contract.duration,
              }}
              onSubmit={onSubmit}
              onSubscribe={() => {}}
              updating={true}
              isContract={true}
            />
            <TwoFAModal
              ref={twoFaRef}
              title={t("Two-Factor Authentification")}
              content={t("A Two-Factor OTP has been sent to the user by email/sms.")}
              onCancel={() => {
                setInProgress(false);
                formRef.current.hideLoader();
              }}
              onContinue={otp => onSubmit(pendingData, otp)}/>
          </Paper>
        </>
      )}
    </>
  );
};

export default ContractUpdate;
