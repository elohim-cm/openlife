/* eslint-disable @next/next/no-img-element */
import {Typography} from "@mui/material";
import React, {useCallback, useEffect, useState} from "react";
import Grid from "@mui/material/Unstable_Grid2";
import {useTranslation} from "react-i18next"; // Kept for potential future use, but not used here
import {collection_ind, canceled_ind} from "@/utils/assets/assets";
import {COLLECTION_LIST, DASHBOARD_PAGE, PAYMENT_REDEMPTION_LIST} from "@/utils/routes/routes";
import SubscriptionIndicators from "@/components/Dashboard/indicators/SubscriptionIndicators";
import ContractIndicators from "@/components/Dashboard/indicators/ContractIndicators";
import CollectionIndicators from "@/components/Dashboard/indicators/CollectionIndicators";
import Skeleton from "@mui/material/Skeleton";
import DashboardService from "@/services/DashboardService";
import {formatNumberStr, getLanguage, getToken} from "@/utils";
import {displayHttpError} from "@/utils/api";
import {useRouter} from "next/navigation";
import RedemptionIndicators from "@/components/Dashboard/indicators/RedemptionIndicators";
import {Box} from "@mui/material";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";

const DashboardSubscriber = () => {
  const [focusSubscription, setFocusSubscription] = useState(true);
  const [focusContract, setFocusContract] = useState(false);
  const [focusCollection, setFocusCollection] = useState(false);
  const [focusRedemption, setFocusRedemption] = useState(false);
  const [collectionData, setCollectionData] = useState(null);
  const [redemptionData, setRedemptionData] = useState(null);
  const [unpaidData, setUnpaidData] = useState(null);
  const router = useRouter();
  const { t } = useTranslation();

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
      {(unpaidData != null && collectionData != null && redemptionData != null) ? (
        <IndicatorPattern
          card={{
            "name": t('keyFigures'),
            "data":{
              "title": [t('collectionSum'),t('unpaidSum'),t('redemptionVal')],
              "value": [
                formatNumberStr(collectionData.collection_sum, getLanguage()),
                formatNumberStr(unpaidData.unpaid_sum, getLanguage()),
                formatNumberStr(redemptionData.redemption_value, getLanguage())
              ],
              "type": ["payment","rejected","validated"],
              "color": ["green","red","blue"],
            },
            "link": [COLLECTION_LIST,DASHBOARD_PAGE+'/#',PAYMENT_REDEMPTION_LIST]
          }}
        />
      ) : (
        <IndicatorSkeleton columnsNumber={3} />
      )}
      <br />
      <SubscriptionIndicators
        focus={focusSubscription}
        onGotData={() => {
          setFocusContract(true);
        }}
      />
      <br />
      <ContractIndicators
        focus={focusContract}
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
        onGotData={_data => {
          setRedemptionData(_data);
          getUnpaidData();
        }}
      />
      <br />
    </>
  );
};

export default DashboardSubscriber;
