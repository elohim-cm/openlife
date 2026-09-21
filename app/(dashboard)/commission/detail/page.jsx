"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {formatNumber, getStatusBadge, getToken, getUid, sleep, toCaptitalize} from "@/utils";
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
import PromptModal from "@/components/Commission/PromptModal";
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
import commissionService from "@/services/CommissionService";
import TableHistoriesCommission from "@/components/Commission/TableHistoriesCommission";
import CommissionService from "@/services/CommissionService";
import { getContent, getTitle, getVerb } from "@/utils/CommissionUtils";

let viewer;

const RedemptionDetailsPage = () => {
    const {t} = useTranslation();
    const [record, setRecord] = useState(null);
    const [inProgress, setInprogress] = React.useState(false);
    const token = getToken();
    const context = useAppContext();
    const router = useRouter();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const [isShow, setIsShow] = useState(false);
    const [histories, setHistories] = useState(undefined);
    const [pagination, setPagination] = useState(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const [qValue, setqValue] = useState('');
    const [nature, setNature] = useState('');
    const promptRef = useRef(null)

    const getRecord = useCallback(
        async _uid => {
            const result = await commissionService.show(token, _uid);
            context.togglePageLoading(false);
            if (!result.error) {
                setRecord(result.commission);
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

    const refresh = () => {
        context.togglePageLoading(true);
        setRecord(null);
        getRecord(getUid());
    };

    const handleLoadHistoryOfRedemption = async () => {
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
                    const {history, pagination} = await commissionService.getHistories(token, uuid, currentPage, qValue);
                    setHistories(history);
                    setPagination(pagination);
                } catch (e) {
                    AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
                }
            };
            fetchData();
        }
    }, [isShow, token, currentPage, context, router, qValue]);

    const handleApproveCommision = () => {
        promptRef.current?.open()
        setNature('approval')
    }
    const handleValidateCommision = () => {
        promptRef.current?.open()
        setNature('validation')
    }

    const action = t => ({
        'approval': [commissionService.approve, t("requestSuccessfullyApproved")],
        'validation': [commissionService.validate, t("requestSuccessfullyValidated")],
    })

    const handleSendRequest = async (_value) =>{
        if (!inProgress) {
            setInprogress(true);
            // const result = await commissionService.approve(token, {commissions, raison: _value, is_validated: true}, getUid());
            const result = await action(t)[nature][0](token, {commissions:[getUid()], comment: _value, is_accepted: true}) ;
            setInprogress(false);
            if (result?.error == null) {
                promptRef.current?.close();
                Toast.success(action(t)[nature][1]);
                refresh();
            } else {
                displayHttpError(result?.error, router);
            }
        }
    }
    return (
        <div>
            <Stack direction='row' sx={{mb: 2}}>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    color="secondary"
                    onClick={e => {
                        context.togglePageLoading(true);
                        router.back();
                    }}

                >
                    {t("back")}
                </Button>
                <ButtonGroup variant="contained" aria-label="Basic button group" sx={{marginLeft:'12px'}}>
                    {record?.status === CommissionService.APPROVAL && UtilMethods.isTechnicalReferent() && UtilMethods.getHabilitations(authorizations, "commission").canApprove && (
                        <Button disabled={inProgress} color="secondary" onClick={() => handleApproveCommision()}>
                            {t("approve")}
                        </Button>
                    )}
                    {record?.status === CommissionService.VALIDATION && UtilMethods.isPDG() && UtilMethods.getHabilitations(authorizations, "commission").canValidate && (
                        <Button disabled={inProgress} color="warning" onClick={() => handleValidateCommision()}>
                            {t("validate")}
                        </Button>
                    )}
                    {/*{record?.status === '' && UtilMethods.isTresearer() && UtilMethods.getHabilitations(authorizations, "commission").canPay && (
                    <Button disabled={inProgress} color="secondary" onClick={() => handlePayCommision(record.uid)}>
                        {t("validate")}
                    </Button>
                )}*/}
                </ButtonGroup>
            </Stack>
            {record ? (
                <>
                    <MDBox bgColor="white" className="__box" mb={2}>
                        <Grid container spacing={2}>
                            <Grid xs={12} md={12} lg={12} xl={12}>
                                <MDTypography color="text" variant="h6">
                                    {t("commissionInformation")}
                                </MDTypography>
                                <InfoItem
                                    label={t("code")}
                                    value={record.code}
                                    second={{
                                        label: `${t("status")}`,
                                        value: getStatusBadge(record.status, t),
                                    }}
                                />
                                <InfoItem
                                    label={t("taxation")}
                                    value={record.tax_amount}
                                    second={{
                                        label: `${t("netAmount")}`,
                                        value: formatNumber(record.net_amount),
                                    }}
                                />
                                <InfoItem
                                    label={t("collectionReference")}
                                    value={record.collection_reference}
                                    second={{
                                        label: `${t("collectionAmount")}`,
                                        value: formatNumber(record.collection_amount),
                                    }}
                                />
                                <InfoItem
                                    label={t("collectionDate")}
                                    value={moment(record.collection_date).format("DD/MM/YYYY")}
                                    second={{
                                        label: `${t("date")}`,
                                        value: moment(record.created_at).format("DD/MM/YYYY"),
                                    }}
                                />
                                <InfoItem
                                    label={t("amount")}
                                    value={formatNumber(record.amount)}
                                    second={{
                                        label: `${t("provider")}`,
                                        value: `${record.provider.last_name || ''} ${record.provider.first_name || ''}`,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </MDBox>
                    <MDBox mt={2} mb={2}>
                        <MDButton variant="contained" color="primary" onClick={handleLoadHistoryOfRedemption} sx={{mb: 2}}>
                            {`${isShow ? t("closeCommissionHistory") : t("openCommissionHistory")}`}
                        </MDButton>
                    </MDBox>
                    {isShow && (
                        <MDBox>
                            {histories === undefined ? (
                                <TableSkeleton rowsNumber={4} />
                            ) : (
                                <TableHistoriesCommission histories={histories} pagination={pagination} onHandleSetCurrentPage={setCurrentPage} onHandleSetqValue={setqValue} />
                            )}
                        </MDBox>
                    )}
                </>
            ) : (
                <div>{t("inProgress")}</div>
            )}
            <PromptModal
                ref={promptRef}
                title={getTitle(UtilMethods, t)}
                content={getContent(UtilMethods, t)}
                labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
                required={true}
                inProgress={inProgress}
                onSendRequest={_value => handleSendRequest(_value)}
            />
        </div>
    );
};

export default RedemptionDetailsPage;
