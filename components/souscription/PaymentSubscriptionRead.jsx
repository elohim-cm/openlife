import React, {useCallback, useEffect, useState} from "react";
import {formatNumber, getStatusBadge, getToken, getUid} from "@/utils";
import {useParams, useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {Box, Button, Stack, Typography} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import PaymentService from "@/services/Payment";
import MDTypography from "@/material/components/MDTypography";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import InfoItem from "@/components/souscription/details/InfoItem";
import UtilMethods from "@/utils/UtilMethods";
import Routes from "@/utils/routes";
import {useTranslation} from "react-i18next";
import {displayHttpError} from "@/utils/api";

const PaymentSubscriptionRead = () => {
    const {t} = useTranslation();
    const uuid = getUid();
    const [payment, setPayment] = useState(undefined);
    const [inProgress, setInProgress] = useState(false);
    const [isVisible, setIsvisible] = useState(false);
    const router = useRouter();
    const token = getToken();
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
    // const uuid = location.pathname.split('/').pop()

    const getPayment = useCallback(
        async (uuid) => {
            const {data, error} = await PaymentService.show(token, uuid);
            if(error === null){
                setPayment(data)
            }else{
                displayHttpError(error.response)
            }
        },
        [token, router, uuid, context],
    );

    useEffect(() => {
        context.togglePageLoading(true);
        getPayment(uuid);
        context.togglePageLoading(false);
    }, [getPayment, token, uuid]);


    return (
        <MDBox mt={2}>
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
            <MDTypography variant="h6" mb={1}>
                {t("paymentInformation")}
            </MDTypography>

            {payment !== undefined ? (
                <>
                    <MDBox bgColor="white" className="__box" mb={2}>
                        <Grid container spacing={2}>
                            <Grid xs={12} md={6} lg={6} xl={6} className="__item-separator">
                                <InfoItem
                                    label={t("initiationDate")}
                                    value={payment?.date_init}
                                    second={{
                                        label: `${t("status")}`,
                                        value: getStatusBadge(payment?.status, t),
                                    }}
                                />
                                <InfoItem
                                    label={t("entryReference")}
                                    value={payment?.ref_in}
                                    second={{
                                        label: `${t("type")}`,
                                        value: payment?.type,
                                    }}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={6}>
                                <InfoItem
                                    label={t("exitReference")}
                                    value={payment?.ref_out}
                                    second={null}
                                />
                                <InfoItem
                                    label={t("phoneNumber")}
                                    value={payment?.phone}
                                    second={{
                                        label: t("amount"),
                                        value: formatNumber(payment?.amount),
                                    }}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={6} className="__item-separator">
                                <InfoItem
                                    label={t("validationDate")}
                                    value={payment?.validation_date || ''}
                                    second={null}
                                />
                                <InfoItem
                                    label={t("creationDate")}
                                    value={payment?.created_at}
                                    second={{
                                        label: `${t("updateDate")}`,
                                        value: payment?.updated_at,
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </MDBox>
                    {payment?.type === PaymentService.COLLECTION && UtilMethods.getHabilitations(authorizations, "collection").canRead && <Link href={Routes.COLLECTION_DETAILS(payment?.item)}>
                        <Button variant="contained" color="primary" onClick={() => context.togglePageLoading(true)}>
                            {t("openPayment")}
                        </Button>
                    </Link>}
                    {payment?.type === PaymentService.SUBSCRIPTION && UtilMethods.getHabilitations(authorizations, "subscription").canRead && <Link href={Routes.SOUSCRIPTION_DETAILS(payment?.item)}>
                        <Button variant="contained" color="primary" onClick={() => context.togglePageLoading(true)}>
                            {t("openSubscription")}
                        </Button>
                    </Link>}
                </>
            ) : (
                <></>
            )}
        </MDBox>
    )
}
export default PaymentSubscriptionRead;
