/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {formatNumberStr, getLanguage, getToken} from "@/utils";
import {useRouter} from "next/navigation";
import DashboardService from "@/services/DashboardService";
import {displayHttpError} from "@/utils/api";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
import Routes from "@/utils/routes";
import {ACCOUNT_LISTING_PAGE} from "@/utils/routes/routes";

const AccountIndicators = ({focus = true, onGotData}) => {
  const [accounts, setAccounts] = useState(null);
  const [ready, setReady] = useState(false);
  const {t} = useTranslation();
  const token = getToken();
  const router = useRouter();

  const getRecord = useCallback(async () => {
    const result = await DashboardService.account(token);
    if (result.error == null) {
      setAccounts(result.data);
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
        accounts ? (
            <IndicatorPattern
              card={{
                "name": t('account'),
                "data":{
                  "title": [t('TotalAccounts'), t('ActiveAccounts'), t('SuspendedAccounts'), t('InactiveAccounts')],
                  "value": [
                    formatNumberStr(accounts ? Object.values(accounts.status).reduce((a, b) => a + b, 0) : 0, getLanguage(), '', true, 0),
                    formatNumberStr(accounts?.status.active || 0, getLanguage(), '', true, 0),
                    formatNumberStr(accounts?.status.pending || 0, getLanguage(), '', true, 0),
                    formatNumberStr(accounts?.status.inactive || 0, getLanguage(), '', true, 0)
                  ],
                  "type": ["total","active","suspended","inactive"],
                  "color": ["blue","green","orange","red"],
                },
                "link": [
                  ACCOUNT_LISTING_PAGE,
                  Routes.withParameters(ACCOUNT_LISTING_PAGE, [{status: "active"}]),
                  Routes.withParameters(ACCOUNT_LISTING_PAGE, [{status: "suspended"}]),
                  Routes.withParameters(ACCOUNT_LISTING_PAGE, [{status: "inactive"}]),
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

export default AccountIndicators;