import React, {useCallback, useState} from "react";
import {useTranslation} from "react-i18next";
import CollectionIndicators from "@/components/Dashboard/indicators/CollectionIndicators";
import RedemptionIndicators from "@/components/Dashboard/indicators/RedemptionIndicators";
import PaymentIndicators from "@/components/Dashboard/indicators/PaymentIndicators";
import AccountIndicators from "@/components/Dashboard/indicators/AccountIndicators";
import {Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import Indicator from "@/components/Dashboard/Indicator";
import {canceled_ind, collection_ind} from "@/utils/assets/assets";
import ContractIndicators from "@/components/Dashboard/indicators/ContractIndicators";
import Skeleton from "@mui/material/Skeleton";
import {useRouter} from "next/navigation";
import DashboardService from "@/services/DashboardService";
import {getToken} from "@/utils";
import {displayHttpError} from "@/utils/api";
import {COLLECTION_LIST} from "@/utils/routes/routes";

const DashboardPDG = () => {
  const [focusContract, setFocusContract] = useState(false);
  const [focusCollection, setFocusCollection] = useState(false);
  const [focusRedemption, setFocusRedemption] = useState(false);
  const [unpaidData, setUnpaidData] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const {t} = useTranslation();
  const router = useRouter();

  const getUnpaidData = useCallback(async () => {
    const result = await DashboardService.unpaid(getToken());
    if (result.error == null) {
      setUnpaidData(result.data);
    } else {
      displayHttpError(result.error, router);
    }
  }, [router]);

  return (
    <>
      <>
        <Typography variant="h6" component="h6" mb={1}>
          {t("keyFigures")}
        </Typography>
        <Grid container spacing={2}>
          <Grid xs={12} sm={6} md={4} lg={3} xl={3}>
            {unpaidData != null ? (
              <Indicator color={"error"} title={t("unpaidSum")} counter={unpaidData.unpaid_sum} img={canceled_ind} />
            ) : (
              <Skeleton variant="rounded" sx={{bgcolor: "#cdcdcd"}} height={191} />
            )}
          </Grid>
        </Grid>
      </>
      <br />
      <ContractIndicators
        focus={true}
        onGotData={() => {
          setFocusCollection(true);
        }}
      />
      <br />
      <CollectionIndicators
        focus={focusCollection}
        onGotData={_data => {
          setCollectionData(_data);
          setFocusRedemption(true);
        }}
      />
      <br />
      <RedemptionIndicators
        focus={focusRedemption}
        onGotData={() => {
          getUnpaidData();
        }}
      />
      <br />
    </>
  );
};

export default DashboardPDG;
