import React, {useCallback, useEffect, useState} from "react";
import {formatNumber, getStatusBadge, getToken, getUid} from "@/utils";
import {useParams, useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {Button} from "@mui/material";
import {BUYBACK_SHOW} from "@/utils/routes/routes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import Link from "next/link";
import PaymentService from "@/services/Payment";
import MDTypography from "@/material/components/MDTypography";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import InfoItem from "@/components/souscription/details/InfoItem";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import {displayHttpError} from "@/utils/api";

const PaymentRedemptionRead = () => {
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
            const {data, error} = await PaymentService.showRedemption(token, uuid);
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
                                    label={t("validationDate")}
                                    value={payment?.date || ''}
                                    second={null}
                                />
                            </Grid>
                            <Grid xs={12} md={6} lg={6} xl={6} className="__item-separator">
                                <InfoItem
                                    label={t("creationDate")}
                                    value={payment?.created_at}
                                    second={{
                                        label: t("updateDate"),
                                        value: payment?.updated_at,
                                    }}
                                />
                                <InfoItem
                                    label={t("phoneNumber")}
                                    value={payment?.phone}
                                    second={{
                                        label: `${t("amount")}`,
                                        value: formatNumber(payment?.amount),
                                    }}
                                />
                            </Grid>
                        </Grid>
                    </MDBox>
                    {UtilMethods.getHabilitations(authorizations, "redemption").canRead && <Link href={BUYBACK_SHOW(payment?.item)}>
                        <Button variant="contained" color="primary" onClick={() => context.togglePageLoading(true)}>
                            {t("openRedemption")}
                        </Button>
                    </Link>}
                </>
            ) : (
                <></>
            )}
        </MDBox>
    )
}
export default PaymentRedemptionRead;
