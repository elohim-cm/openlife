import {useTranslation} from "react-i18next";
import {Typography} from "@mui/material";
import React, {useCallback, useState} from "react";
import Grid from "@mui/material/Unstable_Grid2";
import Indicator from "@/components/Dashboard/Indicator";
import {canceled_ind, collection_ind, validated_ind} from "@/utils/assets/assets";
import SubscriptionIndicators from "@/components/Dashboard/indicators/SubscriptionIndicators";
import ContractIndicators from "@/components/Dashboard/indicators/ContractIndicators";
import CommissionIndicators from "@/components/Dashboard/indicators/CommissionIndicators";
import {useRouter} from "next/navigation";
import DashboardService from "@/services/DashboardService";
import {formatNumberStr, getLanguage, getToken} from "@/utils";
import {displayHttpError} from "@/utils/api";
import RedemptionIndicators from "@/components/Dashboard/indicators/RedemptionIndicators";
import Skeleton from "@mui/material/Skeleton";
import CollectionIndicators from "@/components/Dashboard/indicators/CollectionIndicators";
import UtilMethods from "@/utils/UtilMethods";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";
import AffiliationLinkButton from "@/components/Dashboard/AffiliationLinkButton";
import {DASHBOARD_PAGE, COLLECTION_LIST, PAYMENT_REDEMPTION_LIST} from "@/utils/routes/routes";

const DashboardProvider = ({isBusiness}) => {
  const [focusSubscription, setFocusSubscription] = useState(true);
  const [focusContract, setFocusContract] = useState(false);
  const [focusCollection, setFocusCollection] = useState(false);
  const [focusCommission, setFocusCommission] = useState(false);
  const [focusRedemption, setFocusRedemption] = useState(false);
  const [redemptionData, setRedemptionData] = useState(null);
  const [collectionData, setCollectionData] = useState(null);
  const [unpaidData, setUnpaidData] = useState(null);
  const router = useRouter();
  const {t} = useTranslation();

  const getUnpaidData = useCallback(async () => {
    const result = await DashboardService.unpaid(getToken());
    if (result.error == null) {
      setUnpaidData(result.data);
      setFocusCommission(true);
    } else {
      displayHttpError(result.error, router);
    }
  }, [router]);

  return (
    <>
      {UtilMethods.isProvider() && <AffiliationLinkButton />}
      <>
        {(unpaidData != null && collectionData != null && redemptionData != null) ? (
          <IndicatorPattern
            card={{
              "name": t('keyFigures'),
              "data":{
                "title": [t('collectionSum'),t('unpaidSum'),t('redemptionVal'),t('processing')],
                "value": [
                  formatNumberStr(collectionData.collection_sum, getLanguage()),
                  formatNumberStr(unpaidData.unpaid_sum, getLanguage()),
                  formatNumberStr(redemptionData.redemption_sum, getLanguage()),
                  formatNumberStr(collectionData.collection_sum - redemptionData.redemption_sum, getLanguage())
                ],
                "type": ["payment","rejected","validated","processing"],
                "color": ["green","red","blue", "orange"],
              },
              "link": [COLLECTION_LIST,DASHBOARD_PAGE+'/#',PAYMENT_REDEMPTION_LIST,DASHBOARD_PAGE+'/#']
            }}
          />
        ) : (
          <IndicatorSkeleton columnsNumber={4} />
        )}
      </>
      <br />
      <SubscriptionIndicators
        focus={focusSubscription}
        onGotData={() => {
          setFocusContract(true);
        }}
      />
      <br />
      {!isBusiness && <ContractIndicators
        focus={focusContract}
        onGotData={() => {
          setFocusCollection(true);
        }}
      />}
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
        focus={focusRedemption ||
            UtilMethods.isCommercialDirector() ||
            UtilMethods.isINPECTOR() ||
            UtilMethods.isMANAGER() ||
            UtilMethods.isAnimator()
        }
        onGotData={_data => {
          setRedemptionData(_data);
          getUnpaidData();
        }}
      />
      <br />
      {(!isBusiness)&& <CommissionIndicators
        focus={focusCommission}
        onGotData={() => {
          console.log("Ready...");
        }}
      />}
      <br />
    </>
  );
};

export default DashboardProvider;
