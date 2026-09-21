import Routes from "@/utils/routes";
import {CONTRACT_LIST} from "@/utils/routes/routes";
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {formatNumberStr, getLanguage, getToken} from "@/utils";
import {useRouter} from "next/navigation";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";
import DashboardService from "@/services/DashboardService";
import {displayHttpError} from "@/utils/api";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";

const ContractIndicators = ({focus = true, onGotData}) => {
  const [contracts, setContracts] = useState(null);
  const [ready, setReady] = useState(false);
  const {t} = useTranslation();
  const token = getToken();
  const router = useRouter();
  
  const getRecord = useCallback(async () => {
    const result = await DashboardService.contract(token);
    if (result.error == null) {
      setContracts(result.data);
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
        contracts ? (
          <IndicatorPattern
            card={{
              "name": t('contracts'),
              "data":{
                "title": [t('processing'), t('fence'), t('expired'), t('suspended')],
                "value": [
                  formatNumberStr(contracts.status.processing || 0, getLanguage(), '', true),
                  formatNumberStr(contracts.status.fence || 0, getLanguage(), '', true),
                  formatNumberStr(contracts.status.expired || 0, getLanguage(), '', true),
                  formatNumberStr(contracts.status.suspended || 0, getLanguage(), '', true)
                ],
                "type": ['processing','validated','rejected','suspended'],
                "color": ["green","blue","gray","red"],
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

export default ContractIndicators;
