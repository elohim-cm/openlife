import Routes from "@/utils/routes";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {formatNumberStr, getLanguage, getToken} from "@/utils";
import DashboardService from "@/services/DashboardService";
import {displayHttpError} from "@/utils/api";
import {useRouter} from "next/navigation";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";

import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
const SubscriptionIndicators = ({focus = true, onGotData}) => {
  const [subscription, setSubscription] = useState(null);
  const [ready, setReady] = useState(false);
  const {t} = useTranslation();
  const token = getToken();
  const router = useRouter();
  
  const getRecord = useCallback(async () => {
    const result = await DashboardService.subscription(token);
    if (result.error == null) {
      setSubscription(result.data);
      setReady(true);
      onGotData(result.data);
    } else {
      displayHttpError(result.error, router);
      onGotData();
    }
  }, [router, token]);

  useEffect(() => {
    if (focus) {
      getRecord();
    }
  }, [focus, getRecord]);

  return (
    <>
      {ready ?
        subscription ? (
          <IndicatorPattern
            card={{
              "name": t('subscriptions'),
              "data":{
                "title": [t('validated'), t('payment'), t('draft'), t('rejected')],
                "value": [
                  formatNumberStr(subscription.status.validated || 0, getLanguage(), '', true),
                  formatNumberStr(subscription.status.payment || 0, getLanguage(), '', true),
                  formatNumberStr(subscription.status.draft || 0, getLanguage(), '', true),
                  formatNumberStr(subscription.status.rejected || 0, getLanguage(), '', true)
                ],
                "type": ['validated','payment','draft','rejected'],
                "color": ["green","orange","gray","red"],
               },
              "link": [
                Routes.withParameters(Routes.SOUSCRIPTION_LIST, [{status: "validated"}]),
                Routes.withParameters(Routes.SOUSCRIPTION_LIST, [{status: "payment"}]),
                Routes.withParameters(Routes.SOUSCRIPTION_LIST, [{status: "draft"}]),
                Routes.withParameters(Routes.SOUSCRIPTION_LIST, [{status: "rejected"}])
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

export default SubscriptionIndicators;
