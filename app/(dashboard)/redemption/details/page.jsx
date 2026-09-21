"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {
  formatNumber,
  formatNumberStr,
  getLanguage,
  getRoleCode,
  getStatusBadge,
  getToken,
  getUid,
  sleep,
  toCaptitalize,
} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import {useRouter} from "next/navigation";
import {displayHttpError} from "@/utils/api";
import Routes from "@/utils/routes";
import buyBackService from "@/services/BuyBackService";
import {Button, ButtonGroup, Stack} from "@mui/material";
import Constants from "@/utils/constants";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import MDTypography from "@/material/components/MDTypography";
import InfoItem from "@/components/souscription/details/InfoItem";
import moment from "moment";
import Link from "next/link";
import ConfirmModal from "@/components/ConfirmModal";
import ActivityIndicator from "@/components/ActivityIndicator";
import PromptModal from "@/components/PromptModal";
import Toast from "@/utils/toast";
import UtilMethods from "@/utils/UtilMethods";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
import MDButton from "@/material/components/MDButton";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import AuthService from "@/services/AuthService";
import TableHistories from "@/components/buyback/TableHistories";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useTranslation} from "react-i18next";
import BuyBackService from "@/services/BuyBackService";
import RegularizeDepositModal from "@/components/RegularizeDepositModal";
import TwoFAModal from "@/components/TwoFAModal";

let viewer;

const RedemptionDetailsPage = () => {
  const {t} = useTranslation();
  const [record, setRecord] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [inProgress, setInprogress] = React.useState(false);
  const token = getToken();
  const context = useAppContext();
  const router = useRouter();
  const confirmAcceptRef = useRef(null);
  const confirmDeleteRef = useRef(null);
  const confirmApproveRef = useRef(null);
  const confirmValidateRef = useRef(null);
  const confirmPaymentRef = useRef(null);
  const confirmRef = useRef(null);
  const confirmCancelRef = useRef(null);
  const confirmRegularizelRef = useRef(null);
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const [isShow, setIsShow] = useState(false);
  const [histories, setHistories] = useState(undefined);
  const [pagination, setPagination] = useState(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const [qValue, setqValue] = useState("");

  const twoFaRef = useRef(null);

  const getRecord = useCallback(
    async _uid => {
      const result = await buyBackService.getOne(token, _uid);
      context.togglePageLoading(false);
      if (!result?.error) {
        setRecord(result?.buyback);
      } else {
        displayHttpError(result?.error, router);
      }
    },
    [router, token],
  );

  React.useEffect(() => {
    if (token == null || token === "") router.push(Routes.LOGIN);
    const uid = getUid();
    getRecord(uid);
  }, [getRecord, router, token]);

  useEffect(() => {
    if (record != null) {
      viewer = new Viewer(document.getElementById("cniFilesRachat"));
    }
  }, [record]);

  const refresh = () => {
    context.togglePageLoading(true);
    setRecord(null);
    getRecord(getUid());
  };

  const handleAccept = async _value => {
    if (!inProgress) {
      setInprogress(true);
      const result = await buyBackService.acceptBuyback(token, {raison: _value, is_accepted: true}, getUid());
      setInprogress(false);
      if (result?.error == null) {
        confirmAcceptRef.current?.close();
        Toast.success(t("requestSuccessfullyAccepted"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };
  const handleConfirm = async _value => {
    if (!inProgress) {
      setInprogress(true);
      const result = await buyBackService.confirmBuyback(token, {code: _value}, getUid());
      setInprogress(false);
      if (result?.error == null) {
        confirmRef.current?.close();
        Toast.success(t("requestSuccessfullyConfirmed"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };

  const handleCancel = async _value => {
    if (!inProgress) {
      setInprogress(true);
      const result = await buyBackService.cancelBuyback(token, {raison: _value}, getUid());
      setInprogress(false);
      if (result?.error == null) {
        confirmCancelRef.current?.close();
        Toast.success(t("redemptionSuccessfullyCanceled"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };

  const handleRegularize = async _value => {
    if (!inProgress) {
      setInprogress(true);
      const result = await buyBackService.regularize(token, getUid(), {..._value});
      setInprogress(false);
      if (result?.error == null) {
        confirmRegularizelRef.current?.close();
        Toast.success(t("redemptionSuccessfullyPaid"));
        window.location.reload()
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };

  const handleReject = async _value => {
    console.log(Constants.STATUS_REDEMPTION.validation, record.status)
    if (!inProgress) {
      setInprogress(true);
      let result;
      if (record.status === Constants.STATUS_REDEMPTION.confirmation)
        result = await buyBackService.rejectBuyback(token, {raison: _value, is_accepted: false}, getUid());
      if (record.status === Constants.STATUS_REDEMPTION.acceptance)
        result = await buyBackService.acceptBuyback(token, {raison: _value, is_accepted: false}, getUid());
      else if (record.status === Constants.STATUS_REDEMPTION.approval)
        result = await buyBackService.approveBuyback(token, {raison: _value, is_approved: false}, getUid());
      else if (record.status === Constants.STATUS_REDEMPTION.validation)
        result = await buyBackService.validateBuyback(token, {raison: _value, is_validated: false}, getUid());
      else if (record.status === Constants.STATUS_REDEMPTION.payment)
        result = await buyBackService.rejectBuyback(token, {raison: _value, is_validated: false}, getUid());
      setInprogress(false);
      if (result?.error == null) {
        confirmDeleteRef.current?.close();
        Toast.success(t("requestSuccessfullyRejected"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };

  const handleApprove = async _value => {
    if (!inProgress) {
      setInprogress(true);
      const result = await buyBackService.approveBuyback(token, {raison: _value, is_approved: true}, getUid());
      setInprogress(false);
      if (result?.error == null) {
        confirmApproveRef.current?.close();
        Toast.success(t("requestSuccessfullyApproved"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };
  const handleValidate = async _value => { 
    if (!inProgress) {
      setInprogress(true);
      const result = await buyBackService.validateBuyback(token, {raison: _value, is_validated: true}, getUid());
      setInprogress(false);
      if (result?.error == null) {
        confirmValidateRef.current?.close();
        Toast.success(t("requestSuccessfullyValidated"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };
  const handlePayment = async (_value, _otp = null) => {
    if (!inProgress) {
      setInprogress(true);
      const isOtherPaymentThanMomo = record.payment_system && (record.payment_system?.payment_method?.code === "VIREMENT" || record.payment_system?.payment_method?.code === "CHEQUE")

      const result = await buyBackService.payBuyback(
        token,
        _value,
        getUid(),
        record.payment_system.uid,
        (isOtherPaymentThanMomo ||
          (typeof _value === 'object' &&
            _value !== null && Object.prototype.hasOwnProperty.call(_value, 'reference'))),
        _otp
      );
      setInprogress(false);
      twoFaRef.current.toggleLoader(false);

      if(result.error && result.error.response.status === 403 && result.error.response.data.two_step) {
        Toast.warn(result.error.response.data.message);
        setPendingData(_value);
        twoFaRef.current.open(result.error.response.data.data, "notif_action", result.error.response.data.method, result.error.response.data.available_methods);
        return;
      }

      twoFaRef.current.close();
      if (result?.error == null) {
        confirmPaymentRef.current?.close();
        Toast.success(t("requestSuccessfullyPaid"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };
  const handleLoadHistoryTreatmentRedemption = async () => {
    try {
      setIsShow(prev => !prev);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
    }
  };

  useEffect(() => {
    if (isShow) {
      const uuid = getUid();
      const fetchData = async () => {
        try {
          const {history, pagination} = await buyBackService.getHistories(token, uuid, currentPage, qValue);
          setHistories(history);
          setPagination(pagination);
        } catch (e) {
          AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
        }
      };
      fetchData();
    }
  }, [isShow, token, currentPage, context, router, qValue]);

  let tableData = _histories => {
    return (
      _histories?.map(history => ({
        status: getStatusBadge(history?.status, t),
        access: `${history?.access?.account?.last_name || ""} ${history?.access?.account?.first_name || ""} (${
          history?.access?.role?.label
        })`,
        comment: history?.comment,
        created_at: history?.created_at,
      })) || []
    );
  };

  const displayRejectButton = _status => {
    const role = getRoleCode();
    let returnValue = false;
    switch (role) {
      case Constants.ROLES.sous:
        if (_status === Constants.STATUS_REDEMPTION.confirmation) returnValue = true;
        break;
      case Constants.ROLES.scl:
        if (_status === Constants.STATUS_REDEMPTION.acceptance) returnValue = true;
        break;
      case Constants.ROLES.tech:
        if (_status === Constants.STATUS_REDEMPTION.approval) returnValue = true;
        break;
      case Constants.ROLES.pdg:
        if (_status === Constants.STATUS_REDEMPTION.validation) returnValue = true;
        break;
      case Constants.ROLES.admin:
        if (_status === Constants.STATUS_REDEMPTION.payment) returnValue = true;
        break;
      default:
        break;
    }

    return returnValue;
  };

  const handleResendCode = async (_buyBackUid)=> {
    try {
      const result = await BuyBackService.resendConde(token, _buyBackUid)

      Toast.success(result)
    }catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e, context, router)
    }
  }

  return (
    <div>
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
      <MDBox mb={2} style={{position: "relative"}}>
        <ButtonGroup variant="contained">
          {record &&
          displayRejectButton(record.status) ? (
            <Button onClick={() => confirmDeleteRef.current?.open()} color="error">
              {t("reject")}
            </Button>
          ) : (
            <></>
          )}
          {UtilMethods.getHabilitations(authorizations, "redemption").canCancel &&
          record && record.status === Constants.STATUS_REDEMPTION.confirmation ? (
            <Button onClick={() => confirmCancelRef.current?.open()} color="error">
              {t("cancel")}
            </Button>
          ) : (
            <></>
          )}
          {(UtilMethods.isTresearer()) &&
          record && record.status === Constants.STATUS_REDEMPTION.payment ? (
            <Button onClick={() => confirmRegularizelRef.current?.open()} color="error">
              {t("regularize")}
            </Button>
          ) : (
            <></>
          )}
          {record &&
          record.status === Constants.STATUS_REDEMPTION.confirmation &&
          UtilMethods.getHabilitations(authorizations, "redemption").canConfirm ? (
            <>
              <Button color="secondary" onClick={() => confirmRef.current?.open()}>
                {t("confirm")}
              </Button>
              <Button variant='outlined' color="secondary" onClick={() => handleResendCode(record?.uid)}>
                {t("resendCode")}
              </Button>
            </>
          ) : (
            <></>
          )}
          {UtilMethods.getHabilitations(authorizations, "redemption").canAccept &&
          record &&
          record.status === Constants.STATUS_REDEMPTION.acceptance ? (
            <Button color="secondary" onClick={() => confirmAcceptRef.current?.open()}>
              {t("accept")}
            </Button>
          ) : (
            <></>
          )}
          {UtilMethods.getHabilitations(authorizations, "redemption").canApprove &&
          record &&
          record.status === Constants.STATUS_REDEMPTION.approval ? (
            <Button onClick={() => confirmApproveRef.current?.open()}>{t("approve")}</Button>
          ) : (
            <></>
          )}
          {UtilMethods.getHabilitations(authorizations, "redemption").canValidate &&
          record &&
          record.status === Constants.STATUS_REDEMPTION.validation ? (
            <Button onClick={() => confirmValidateRef.current?.open()} color="secondary">
              {t("validate")}
            </Button>
          ) : (
            <></>
          )}
          {UtilMethods.getHabilitations(authorizations, "redemption").canPay &&
            record && record.status === Constants.STATUS_REDEMPTION.payment ? (
            <Button onClick={() => confirmPaymentRef.current?.open()}>
              {t("pay")}
              </Button>
          ) : (
            <></>
          )}
        </ButtonGroup>
      </MDBox>

      {record ? (
        <>
          <MDBox bgColor="white" className="__box" mb={2}>
            <Grid container spacing={2}>
              <Grid xs={12} md={12} lg={12} xl={12}>
                <MDTypography color="text" variant="h6">
                  {t("redemptionRequestInformation")}
                </MDTypography>
                <InfoItem
                  label={t("code")}
                  value={record.code}
                  second={{
                    label: `${t("status")}`,
                    value: getStatusBadge(UtilMethods.getSubscriberStatus(record.status), t),
                  }}
                />
                <InfoItem
                  label={t("contractNumber")}
                  value={record.contract.code}
                  second={{
                    label: `${t("requestDate")}`,
                    value: moment(record.created_at).format("DD/MM/YYYY HH:mm:ss"),
                  }}
                />
                <InfoItem
                  label={t("amount")}
                  value={formatNumber(record.amount)}
                  second={{
                    label: `${t("redemptionType")}`,
                    value: record.redemption_type.label,
                  }}
                />
                <InfoItem
                  label={t("paymentMode")}
                  value={record.payment_system?.payment_method?.label}
                  second={{
                    label: `${t("paymentSystem")}`,
                    value: record.payment_system?.label,
                  }}
                />
                <InfoItem
                  label={"Valeur de rachat"}
                  value={getStatusBadge(formatNumberStr(record.contract.redemption_value, getLanguage()), t, true)}
                  second={{
                    label: `PM`,
                    value: getStatusBadge(
                      formatNumberStr(record.contract.provision_value ?? "0", getLanguage()),
                      t,
                      true,
                    ),
                  }}
                />
                {
                  record.payment_date ? (
                    <InfoItem
                      label={t("paymentDate")}
                      value={moment(record.payment_date).format("DD/MM/YYYY HH:mm:ss")}
                      second={{
                        label: `${t("paymentRef")}`,
                        value: record.payment_reference,
                      }}
                    />
                  ) : null
                }
                {(record.payment_system && (record.payment_system?.payment_method?.code === "VIREMENT" || record.payment_system?.payment_method?.code === "CHEQUE")) && <>
                  <InfoItem
                      label={t("banckCode")}
                      value={record.bank_code || ''}
                      second={{
                        label: `${t("branchCode")}`,
                        value: record.branch_code || '',
                      }}
                  />
                  <InfoItem
                      label={t("accountNumber")}
                      value={record.account_number || ''}
                      second={{
                        label: `${t("accountKey")}`,
                        value: record.account_key || '',
                      }}
                  />
                </>}
              </Grid>
            </Grid>
          </MDBox>
          <MDBox bgColor="white" className="__box" mb={2}>
            <Grid container spacing={2}>
              <Grid xs={12} md={12} lg={12} xl={12}>
                <MDTypography color="text" variant="h6">
                  {t("beneficiaryInformation")}
                </MDTypography>
                <InfoItem
                  label={t("name")}
                  value={`${record.first_name || ''} ${record.last_name || ''}`}
                  second={{
                    label: `${t("phone")}`,
                    value: record.phone,
                  }}
                />
                <InfoItem label="Adresse" value={record.address} />
                <div className="__flex-row __two" id="cniFilesRachat">
                  <div>
                    <MDTypography color="secondary" variant="button" fontWeight="medium">
                      {t("idCardFront")}
                    </MDTypography>
                    <br />
                    <img
                      onClick={() => {
                        viewer.show();
                      }}
                      src={record.cni_file_main}
                      alt="Image"
                      className="__image-viewer-item"
                    />
                  </div>
                  <div>
                    <MDTypography variant="button" fontWeight="medium">
                      {t("idCardBack")}
                    </MDTypography>
                    <br />
                    <img
                      onClick={() => viewer.show()}
                      src={record.cni_file_secondary}
                      alt="Image"
                      className="__image-viewer-item"
                    />
                  </div>
                </div>
              </Grid>
            </Grid>
          </MDBox>
          {record.payment != null ? (
            <MDBox bgColor="white" className="__box" mb={2}>
              <Grid container spacing={2}>
                <Grid xs={12} md={12} lg={12} xl={12}>
                  <MDTypography color="text" variant="h6">
                    {t("paymentDetails")}
                  </MDTypography>
                  <InfoItem
                    label={t("paymentPhone")}
                    value={record.payment.phone}
                    second={{
                      label: `${t("reference")}`,
                      value: record.payment.ref_out,
                    }}
                  />
                  <InfoItem label={t("paymentDate")} value={record.payment.date_init} />
                </Grid>
              </Grid>
            </MDBox>
          ) : (
            <></>
          )}
          {UtilMethods.getHabilitations(authorizations, "contract").canRead && (
            <Link
              style={{backgroundColor: "primary"}}
              onClick={() => context.togglePageLoading(true)}
              href={Routes.CONTRACT_DETAILS(record.contract.uid)}>
              <Button variant="text">{t("openContract")}</Button>
            </Link>
          )}
          <MDBox mt={2} mb={2}>
            <MDButton variant="contained" color="primary" onClick={handleLoadHistoryTreatmentRedemption} sx={{mb: 2}}>
              {`${isShow ? t("closeRedemptionProcessingHistory") : t("viewRedemptionProcessingHistory")}`}
            </MDButton>
          </MDBox>
          {isShow && (
            <MDBox>
              {histories === undefined ? (
                <TableSkeleton rowsNumber={4} />
              ) : (
                <TableHistories
                  title={t("listingRedemptionProcessingHistory")}
                  pagination={pagination}
                  onHandleSetCurrentPage={setCurrentPage}
                  onHandleSetqValue={setqValue}
                  tableData={tableData(histories)}
                  columns={BuyBackService.columns(t).filter(column => (
                    column.name !== 'amount' &&
                    column.name !== 'actions' &&
                    column.name !== 'date' &&
                    column.name !== 'updated_at'
                  ))}

                />
              )}
            </MDBox>
          )}
          <PromptModal
            ref={confirmPaymentRef}
            title={t("confirmation")}
            content={t("areYouSurePayRedemptionRequest")}
            labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
            required={true}
            inProgress={inProgress}
            isPaymentProcess={true}
            onConfirm={_value => handlePayment(_value)}
            hasPayment = {!!record.payment_system}
            otherPayments={record.payment_system && (record.payment_system?.payment_method?.code === "VIREMENT" || record.payment_system?.payment_method?.code === "CHEQUE")}
          />
        </>
      ) : (
        <div>{t("inProgress")}</div>
      )}
      <PromptModal
        ref={confirmAcceptRef}
        title={t("confirmation")}
        content={t("areYouSureAcceptRedemptionRequest")}
        labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
        required={true}
        inProgress={inProgress}
        onConfirm={_value => handleAccept(_value)}
      />
      <PromptModal
        ref={confirmApproveRef}
        title={t("confirmation")}
        content={t("areYouSureApproveRedemptionRequest")}
        labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
        required={true}
        inProgress={inProgress}
        onConfirm={_value => handleApprove(_value)}
      />
      <PromptModal
        ref={confirmValidateRef}
        title={t("confirmation")}
        content={t("areYouSureValidateRedemptionRequest")}
        labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
        required={true}
        inProgress={inProgress}
        onConfirm={_value => handleValidate(_value)}
      />
      <PromptModal
        ref={confirmDeleteRef}
        title={t("confirmation")}
        content={t("areYouSureRejectRedemptionRequest")}
        labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
        required={!UtilMethods.isSubscriber()}
        inProgress={inProgress}
        onConfirm={_value => handleReject(_value)}
      />
      <PromptModal
        ref={confirmRef}
        title={t("confirmation")}
        content={t("enterConfirmationCodeReceived")}
        labels={{no: t("cancel"), yes: t("confirm"), input: `${t("code")}`}}
        required={true}
        inProgress={inProgress}
        onConfirm={_value => handleConfirm(_value)}
      />
      <PromptModal
        ref={confirmCancelRef}
        title={t("cancellation")}
        content={t("areYouSureCancelRedemptionRequest")}
        labels={{no: t("no"), yes: t("yes"), input: `${t("reason")}`}}
        required={!UtilMethods.isSubscriber()}
        inProgress={inProgress}
        onConfirm={_value => handleCancel(_value)}
      />
      <RegularizeDepositModal
        ref={confirmRegularizelRef}
        title={t("regularization")}
        required={UtilMethods.isCustomerService()}
        inProgress={inProgress}
        onConfirm={_value => handleRegularize(_value)}
        inputProps={{ maxLength: 10, autoComplete: 'off' }}
        withPayment={true}
      />
      <TwoFAModal
        ref={twoFaRef}
        title={t("Two-Factor Authentification")}
        content={t("A Two-Factor OTP has been sent to you by email/sms.")}
        onCancel={() => setInProgress(false)}
        onContinue={otp => handlePayment(pendingData, otp)}/>
    </div>
  );
};

export default RedemptionDetailsPage;
