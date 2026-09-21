import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import RedemptionIndicators from "@/components/Dashboard/indicators/RedemptionIndicators";
import {useRouter} from "next/navigation";
import DashboardService from "@/services/DashboardService";
import {formatNumberStr, getLanguage, getToken} from "@/utils";
import {displayHttpError} from "@/utils/api";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
import {DASHBOARD_PAGE} from "@/utils/routes/routes";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";

const DashboardCustomerService = ({dashboard}) => {
  const [unpaidData, setUnpaidData] = useState(null);
  const [focusRedemption, setFocusRedemption] = useState(false);
  const {t} = useTranslation();
  const router = useRouter();

  const getUnpaidData = useCallback(async () => {
    const result = await DashboardService.unpaid(getToken());
    if (result.error == null) {
      setUnpaidData(result.data);
    } else {
      displayHttpError(result.error, router);
    }
    setFocusRedemption(true);
  }, [router]);

  useEffect(() => {
    getUnpaidData();
  }, [getUnpaidData]);

  return (
    <>
      <>
        {unpaidData != null ? (
          <IndicatorPattern
            card={{
              "name": t('keyFigures'),
              "data":{
                "title": [t('unpaidSum')],
                "value": [formatNumberStr(unpaidData.unpaid_sum, getLanguage())],
                "type": ["rejected"],
                "color": ["red"],
              },
              "link": [DASHBOARD_PAGE+'/#']
            }}
          />
        ) : (
          <IndicatorSkeleton columnsNumber={1} />
        )}
      </>
      <br />
      <RedemptionIndicators focus={focusRedemption} onGotData={() => {}} />
      <br />
    </>
  );
};

export default DashboardCustomerService;
