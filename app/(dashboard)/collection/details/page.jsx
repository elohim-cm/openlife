"use client";

import {useAppContext} from "@/contexts/appContext";
import React, {useCallback, useEffect, useRef, useState} from "react";
import {formatNumber, getStatusBadge, getToken, getUid, sleep, toCaptitalize} from "@/utils";
import {useRouter} from "next/navigation";
import {displayHttpError} from "@/utils/api";
import collectionService from "@/services/CollectionService";
import MDTypography from "@/material/components/MDTypography";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import InfoItem from "@/components/souscription/details/InfoItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Button, ButtonGroup, Stack} from "@mui/material";
import Constants from "@/utils/constants";
import ActivityIndicator from "@/components/ActivityIndicator";
import Toast from "@/utils/toast";
import {useTranslation} from "react-i18next";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import contractService from "@/services/ContractService";
import AuthService from "@/services/AuthService";
import SubscriptionService from "@/services/SubscriptionService";
import CollectionService from "@/services/CollectionService";
import TableHistories from "@/components/buyback/TableHistories";
import UtilMethods from "@/utils/UtilMethods";
import RegularizeDepositModal from "@/components/RegularizeDepositModal";
import buyBackService from "@/services/BuyBackService";

const CollectionDetailsPage = () => {
  const {t} = useTranslation();
    const [inprogress, setInprogress] = React.useState(false);
  const [record, setRecord] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const token = getToken();
  const context = useAppContext();
  const router = useRouter();
  const confirmRegularizelRef = useRef(null);

  //-----
  const [qValue, setqValue] = useState("");
  const [isShow, setIsShow] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [histories, setHistories] = useState(undefined);
  const [pagination, setPagination] = useState(undefined);

  useEffect(() => {
    context.togglePageLoading(false);
  }, []);

  const getRecord = useCallback(
    async _uid => {
      const result = await collectionService.getOne(token, _uid);
      console.log("Result::: ", result);
      if (result.error == null) {
        setRecord(result.collection);
        setReady(true);
      } else {
        displayHttpError(result.error, router);
      }
    },
    [router, token],
  );

  const handleCheckStatus = async () => {
    setInProgress(true);
    const result = await collectionService.checkStatus(token, getUid());
    setInProgress(false);
    if (result.error == null) {
      if (result.data.status === Constants.STATUS_COLLECTION.processing) {
        Toast.success(t("PaymentStillBeingProcessed"), Toast.TOAST_LONG);
      }
      await sleep(1000);
      window.location.reload();
    } else {
      displayHttpError(result.error, router);
    }
  };

  React.useEffect(() => {
    getRecord(getUid());
  }, [getRecord]);

  useEffect(() => {
    if (isShow) {
      const uuid = getUid();
      const fetchData = async () => {
        try {
          const {history, pagination} = await CollectionService.getHistories(token, uuid, currentPage);
          setHistories(history);
          setPagination(pagination);
        } catch (e) {
          AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
        }
      };
      fetchData();
    }
  }, [isShow, token, currentPage, context, router]);

  const handleLoadHistoryCollection = async () => {
    try {
      setIsShow(prev => !prev);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
    }
  };
  let tableData = _histories => {
    return (
      _histories?.map(history => ({
        status: getStatusBadge(history?.status, t),
        access: `${history?.access?.account?.last_name || ""} ${history?.access?.account?.first_name || ""} (${
          history?.access?.role?.label
        })`,
        comment: history?.comment,
        created_at: history?.created_at,
        updated_at: history?.updated_at,
        actions: <Stack direction="row" spacing={1}></Stack>,
      })) || []
    );
  };
    const refresh = () => {
        context.togglePageLoading(true);
        setRecord(null);
        getRecord(getUid());
    };
    const handleRegularize = async _value => {
        if (!inProgress) {
            setInprogress(true);
            const result = await CollectionService.regularize(token, getUid(), {..._value});
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
  return (
    <MDBox mt={2} sx={{position: "relative"}}>
      <ActivityIndicator visible={inProgress} />
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
            {record && [Constants.STATUS_COLLECTION.processing, Constants.STATUS_COLLECTION.rejected].includes(record.status)  ? (
                <Button color="secondary" onClick={handleCheckStatus}>
                    {t("checkStatus")}
                </Button>
            ) : (
                <></>
            )}
          {UtilMethods.isTresearer() &&
            record && ((record.payment && record.status !==  Constants.STATUS_COLLECTION.validated) || record.status === Constants.STATUS_COLLECTION.rejected) ? (
                <Button onClick={() => confirmRegularizelRef.current?.open()} color="error">
                    {t("regularize")}
                </Button>
            ) : (
                <></>
          )}
        </ButtonGroup>
      </MDBox>
      {ready ? (<>
          <div>
              <MDBox bgColor="white" className="__box" mb={2}>
                  <Grid container spacing={2}>
                      <Grid xs={12} md={12} lg={12} xl={12}>
                          <MDTypography variant="h6" mb={1}>
                              {t("collectionInformation")}
                          </MDTypography>
                          <InfoItem
                              label={t("contractCode")}
                              value={record.contract.code}
                              second={{
                                  label: `${t("amount")}`,
                                  value: formatNumber(record.amount),
                              }}
                          />
                          <InfoItem
                              label={t("paymentDate")}
                              value={record.payment_date}
                              second={{
                                  label: `${t("status")}`,
                                  value: getStatusBadge(record.status, t),
                              }}
                          />
                      </Grid>
                  </Grid>
              </MDBox>
              {record.payment ? (
                  <MDBox bgColor="white" className="__box" mb={2}>
                      <Grid container spacing={2}>
                          <Grid xs={12} md={12} lg={12} xl={12}>
                              <MDTypography variant="h6" mb={1}>
                                  {t("paymentInformation")}
                              </MDTypography>
                              <InfoItem
                                  label={t("debitedPhone")}
                                  value={record.payment.phone}
                                  second={{
                                      label: `${t("reference")}`,
                                      value: record.payment_reference,
                                  }}
                              />
                              <InfoItem
                                  label={t("paymentMethod")}
                                  value={record.payment_system ? record.payment_system.payment_method.label : ""}
                                  second={{
                                      label: `${t("paymentSystem")}`,
                                      value: record.payment_system ? record.payment_system.label : "",
                                  }}
                              />
                          </Grid>
                      </Grid>
                  </MDBox>
              ) : (
                  <></>
              )}
          </div>
          <RegularizeDepositModal
              ref={confirmRegularizelRef}
              title={t("regularization")}
              required={UtilMethods.isCustomerService()}
              inProgress={inprogress}
              onConfirm={_value => handleRegularize(_value)}
              inputProps={{ maxLength: 10, autoComplete: 'off' }}
              isRedemption={false}
              withPayment={true}
          />
      </>
      ) : (
        <div>{t("inProgress...")}</div>
      )}
      <MDBox mt={2} mb={2}>
        <Button variant="contained" color="primary" onClick={handleLoadHistoryCollection} sx={{mb: 2}}>
          {`${isShow ? t("closeCollectionHistory") : t("consultCollectionHistory")} `}
        </Button>
      </MDBox>
      {isShow && (
        <MDBox>
          {histories === undefined ? (
            <TableSkeleton rowsNumber={4} />
          ) : (
            <TableHistories
              title={t("listingCollectionProcessingHistory")}
              pagination={pagination}
              onHandleSetCurrentPage={setCurrentPage}
              onHandleSetqValue={setqValue}
              tableData={tableData(histories)}
              columns={CollectionService.columns(t)}
            />
          )}
        </MDBox>
      )}
    </MDBox>
  );
};

export default CollectionDetailsPage;
