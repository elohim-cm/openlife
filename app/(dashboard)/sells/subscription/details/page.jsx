"use client";

import React, {useCallback, useEffect, useState} from "react";
import SubscriptionService from "@/services/SubscriptionService";
import {displayHttpError} from "@/utils/api";
import Routes from "@/utils/routes";
import {useRouter} from "next/navigation";
import SousInfo from "@/components/souscription/details/SousInfo";
import MDTypography from "@/material/components/MDTypography";
import SousBenef from "@/components/souscription/details/SousBenefVie";
import {Button, ButtonGroup, Stack} from "@mui/material";
import MDBox from "@/material/components/MDBox";
import TransferSubscriptionModal from "@/components/souscription/modals/TransferSubscriptionModal";
import {formatNumber, getStatusBadge, getToken, getUid, sleep} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import Constants from "@/utils/constants";
import Toast from "@/utils/toast";
import SousDetailsComponent from "@/components/souscription/details";
import ProviderService from "@/services/ProviderService";
import UtilMethods from "@/utils/UtilMethods";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useTranslation} from "react-i18next";
import AuthService from "@/services/AuthService";
import TableSkeleton from "@/components/skeletons/TableSkeleton"
import subscriptionService from "@/services/SubscriptionService";
import TableHistories from "@/components/buyback/TableHistories";

const SubscriptionDetailPage = () => {
  const {t} = useTranslation();
  const [record, setRecord] = React.useState(null);
  const [inProgress, setInprogress] = React.useState(false);
  const context = useAppContext();
  const router = useRouter();
  const token = getToken();
  const transferRef = React.useRef(null);
  const {
    authorizations,
  } = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //----
  const [histories, setHistories] = useState(undefined);
  const [pagination, setPagination] = useState(undefined);
  const [isShow, setIsShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [qValue, setqValue] = useState("");

  const getRecord = useCallback(
    async _uid => {
      const result = await SubscriptionService.show(token, _uid);
      if (!result.error) {
        setRecord(result.data);
      } else {
        displayHttpError(result.error, router);
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
    if (isShow) {
      const uuid = getUid();
      const fetchData = async () => {
        try {
          const {history, pagination} = await subscriptionService.getHistories(token, uuid, currentPage, qValue);
          setHistories(history);
          setPagination(pagination);
        } catch (e) {
          AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
        }
      };
      fetchData();
    }
  }, [isShow, token, currentPage, context, router, qValue]);
  const handleLoadHistoryContract = async () => {
    try {
      setIsShow(prev => !prev);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
    }
  };

  const handleConfirmation = async () => {
    context.togglePageLoading(true);
    const result = await SubscriptionService.sendCode(record.uid);
    if (result.error == null) {
      router.push(
        Routes.withParams(Routes.SOUS_CONFIRM, [
          {label: "subscription", value: record.uid},
          {label: "prime", value: record.prime},
        ]),
      );
    } else {
      displayHttpError(result.error, router);
      context.togglePageLoading();
    }
  };

  const handleClone = async () => {
    if (!inProgress) {
      setInprogress(true);
      context.togglePageLoading(true);
      const result = await SubscriptionService.clone(token, record.uid);
      if (result.error == null) {
        Toast.success(t("subscriptionSuccessfullyCloned"), Toast.TOAST_SHORT);
        router.back();
      } else {
        displayHttpError(result.error, router);
        context.togglePageLoading();
      }
    }
    setInprogress(false);
  };

  const handleCheckStatus = async () => {
    if (!inProgress) {
      setInprogress(true);
      context.togglePageLoading(true);
      const result = await SubscriptionService.paymentStatus(token, record.uid);
      if (result.error == null) {
        if (
          result.data.status === Constants.STATUS_SUBSCRIPTION.payment &&
          (!result.data.payment_status || result.data.payment_status === "pending")
        ) {
          Toast.success(t("paymentStatus"), Toast.TOAST_LONG);
        }
        await sleep(1000);
        window.location.reload();
      } else {
        displayHttpError(result.error, router);
        context.togglePageLoading();
      }
    }
    setInprogress(false);
  };

  const handlePay = async () => {
    if (!inProgress) {
      setInprogress(true);
      context.togglePageLoading(true);
      router.push(
        Routes.withParams(Routes.SOUS_CONFIRM, [
          {label: "subscription", value: record.uid},
          {label: "prime", value: record.prime},
          {label: "tab", value: 1},
        ]),
      );
    }
    setInprogress(false);
  };
  let tableData = (_histories) => {
    return _histories?.map(history => ({
      status: getStatusBadge(history?.status, t),
      access: `${history?.access?.account?.last_name || ''} ${history?.access?.account?.first_name || ''} (${history?.access?.role?.label})`,
      comment: history?.comment,
      created_at: history?.created_at,
      updated_at: history?.updated_at,
      actions: (
          <Stack direction="row" spacing={1}>
          </Stack>
      ),
    })) || [];
  }
  return (
    <div>
      <MDBox sx={{display: "flex", alignItems: "center", my: 2}} mb={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => {
            context.togglePageLoading(true);
            router.back();
          }}>
          {t("back")}
        </Button>
        <ButtonGroup style={{marginLeft: "16px"}} variant="contained">
          {UtilMethods.getHabilitations(authorizations, "subscription").canClone && (
            <Button color="secondary" onClick={() => handleClone()}>
              {t("clone")}
            </Button>
          )}
          {UtilMethods.getHabilitations(authorizations, "subscription").canTransfer && (
            <Button onClick={() => transferRef.current.open()} color="error">
              {t("mutted")}
            </Button>
          )}
          {UtilMethods.getHabilitations(authorizations, "subscription").canUpdate &&
          record != null &&
          (record.status === Constants.STATUS_SUBSCRIPTION.draft ||
            record.status === Constants.STATUS_SUBSCRIPTION.confirmation) ? (
            <Button onClick={() => {
              context.togglePageLoading(true);
              router.push(Routes.SOUSCRIPTION_UPDATE(record.uid))
            }}>{t("update")}</Button>
          ) : (
            <></>
          )}
          {(record && record.status === Constants.STATUS_SUBSCRIPTION.draft && UtilMethods.canSubscribe())? (
            <Button color="secondary" onClick={handleConfirmation}>
              {t("subscribe")}
            </Button>
          ) : (
            <></>
          )}
          {record && record.status === Constants.STATUS_SUBSCRIPTION.processing ? (
            <Button color="secondary" onClick={handlePay}>
              {t("pay")}
            </Button>
          ) : (
            <></>
          )}
          {record && record.status === Constants.STATUS_SUBSCRIPTION.confirmation ? (
            <Button color="secondary" onClick={handleConfirmation}>
              {t("confirm")}
            </Button>
          ) : (
            <></>
          )}
          {record &&
          record.status === Constants.STATUS_SUBSCRIPTION.payment &&
          (!record.payment_status || ["pending", "rejected"].includes(record.payment_status)) ? (
            <Button color="secondary" onClick={handleCheckStatus}>
              {t("checkStatus")}
            </Button>
          ) : (
            <></>
          )}
          {record &&
          record.payment_status &&
          record.payment_status !== "pending" &&
          record.payment_status !== "validated" ? (
            <Button color="secondary" onClick={handlePay}>
              {t("pay")}
            </Button>
          ) : (
            <></>
          )}
        </ButtonGroup>
      </MDBox>
      {record ? <SousDetailsComponent uid={getUid()} data={record} /> : <></>}
      <TransferSubscriptionModal ref={transferRef} token={token} record={record} />

    {/*  ---------------*/}
      <MDBox mt={2} mb={2}>
        <Button variant="contained" color="primary" onClick={handleLoadHistoryContract} sx={{mb: 2}}>
          {`${isShow ? t("closeSubscriptionHistory") : t("consultSubscriptionHistory")} `}
        </Button>
      </MDBox>
      {isShow && (
          <MDBox>
            {histories === undefined ? (
                <TableSkeleton rowsNumber={4} />
            ) : (
              <TableHistories
                title={t("listingSubscriptionProcessingHistory")}
                pagination={pagination}
                onHandleSetCurrentPage={setCurrentPage}
                onHandleSetqValue={setqValue}
                tableData={tableData(histories)}
                columns={SubscriptionService.columns(t).filter(column => column.name !== 'updated_at' && column.name !== 'actions')}
              />
            )}
          </MDBox>
      )}
    </div>
  );
};

export default SubscriptionDetailPage;
