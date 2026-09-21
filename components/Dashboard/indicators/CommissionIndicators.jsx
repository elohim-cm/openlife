import Routes from "@/utils/routes";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {formatNumberStr, getLanguage, getRoleCode, getToken} from "@/utils";
import {useRouter} from "next/navigation";
import DashboardService from "@/services/DashboardService";
import {displayHttpError} from "@/utils/api";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";
import UtilMethods from "@/utils/UtilMethods";

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import {CONTRACT_LIST} from "@/utils/routes/routes";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";

const CommissionIndicators = ({focus = true, onGotData}) => {
  const [commission, setCommission] = useState(null);
  const [ready, setReady] = useState(false);
  const {t} = useTranslation();
  const token = getToken();
  const router = useRouter();
  
  const getRecord = useCallback(async () => {
    const result = await DashboardService.commission(token);
    if (result.error == null) {
      setCommission(result.data);
      setReady(true);
      onGotData(result.data);
    } else {
      displayHttpError(result.error, router);
      onGotData();
    }
  }, [router, token]);

  useEffect(() => {
    if (!(UtilMethods.isCommercialDirector() ||
        UtilMethods.isINPECTOR() ||
        UtilMethods.isMANAGER() ||
        UtilMethods.isAnimator()
    ) && focus) {
      // getRecord();
      console.log("Commission Indicator disabled :::");
    }else{
      // setReady(true)
      setCommission([])
    }
  }, [focus, getRecord]);

  if (UtilMethods.isCommercialDirector())
    return null

  return (
    <>
      {ready ?
        (typeof commission === 'object' && !Array.isArray(commission)) ? (
          <IndicatorPattern
            card={{
              "name": t('commissions'),
              "data":{
                "title": [t('validated'), t('inPayment'), t('approval'), t('rejected')],
                "value": [
                  formatNumberStr(commission.status.validated.count || 0, getLanguage(), '', true),
                  formatNumberStr(commission.status.payment.count || 0, getLanguage(), '', true),
                  formatNumberStr(commission.status.approval.count || 0, getLanguage(), '', true),
                  formatNumberStr(commission.status.rejected.count || 0, getLanguage(), '', true)
                ],
                "type": ['validated','payment','processing','rejected'],
                "color": ["green","blue","orange","red"],
              },
              "link": [
                Routes.withParameters(CONTRACT_LIST, [{status: "processing"}]),
                Routes.withParameters(CONTRACT_LIST, [{status: "fence"}]),
                Routes.withParameters(CONTRACT_LIST, [{status: "expired"}]),
                Routes.withParameters(CONTRACT_LIST, [{status: "suspended"}]),
              ]
            }}
          />
        ) : null
        : (
          <IndicatorSkeleton columnsNumber={4} />
        )}
    </>
  );
};

export default CommissionIndicators;
