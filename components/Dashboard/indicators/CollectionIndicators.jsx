/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import {getToken, formatNumberStr, getLanguage} from "@/utils";
import { displayHttpError } from "@/utils/api";
import DashboardService from "@/services/DashboardService";
import moment from "moment";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";
import Routes from "@/utils/routes";
import {COLLECTION_LIST} from "@/utils/routes/routes";
import FilterAreaChart from "@/components/FilterAreaChart";
import {Checkbox, FormControlLabel, FormGroup} from "@mui/material";

const CollectionIndicators = ({ focus = true, onGotData }) => {
  const [collections, setCollections] = useState(null);
  const [redemptions, setRedemptions] = useState([]);
  const [compare, setCompare] = useState(false);

  const defaultEndDate = new Date();
  defaultEndDate.setFullYear(defaultEndDate.getFullYear()-1);
  const [dateRange, setDateRange] = useState({
    startDate: defaultEndDate,
    endDate: new Date(),
  });
  const [granularity, setGranularity] = useState('MONTHLY');
  const [providers, setProviders] = useState(null);
  const [filterReady, setFilterReady] = useState(false);
  const [ready, setReady] = useState(false);
  const token = getToken();
  const router = useRouter();
  const { t } = useTranslation();

  // Fetch collection data
  const getRecord = useCallback(async () => {
    setFilterReady(false);
    let params = {};
    //DateRange for filter
    if(dateRange) {
      params.filters = {
        start_date: moment(dateRange.startDate).format("YYYY-MM-DD"),
        end_date: moment(dateRange.endDate).format("YYYY-MM-DD"),
      };
      params.granularity = granularity;
    }
    //Provider for filter
    if(providers) {
      params.providers = providers.uid;
    }
    //Collection request
    const result = await DashboardService.collection(token, params);
    if (result.error == null) {
      setCollections(result.data);
      setReady(true);
      setFilterReady(true);
      onGotData(result.data);
    } else {
      displayHttpError(result.error, router);
      onGotData();
    }

    // If comparison checked
    if(compare){
      setFilterReady(false);
      const resultRedemption = await DashboardService.redemption(token, params);
      if (resultRedemption.error == null) {
        setRedemptions(resultRedemption.data);
        setFilterReady(true);
      } else {
        displayHttpError(resultRedemption.error, router);
      }
    }
  }, [router, token, dateRange, granularity, providers, compare]);

  useEffect(() => {
    if (focus) {
      getRecord();
    }
  }, [focus, getRecord, dateRange, granularity, providers, compare]);

  const getEvolution= useCallback((data)=>{
    let evolutions=[];
    for (const dataKey in data) {
      evolutions.push({
        x: moment(dataKey).format('yyyy-MM-DD'),
        y: data[dataKey],
      });
    }
    return evolutions.reverse();
  }, [collections, redemptions]);

  // Series for status donut chart
  const statusDonutSeries = collections
    ? [
      collections.status?.validated || 0,
      collections.status?.creation || 0,
      collections.status?.processing || 0,
      collections.status?.rejected || 0,
    ]
    : [];

  return (
    <>
      {ready ?
        collections ?
          (
            <>
              <IndicatorPattern
                card={{
                  "name": t("collections"),
                  "data":{
                    "title": [t('validated'),t('inCreation'),t('inProcessing'),t('rejected')],
                    "value": [
                      formatNumberStr(collections.status?.validated || 0, getLanguage(),'', true),
                      formatNumberStr(collections.status?.creation || 0, getLanguage(),'', true),
                      formatNumberStr(collections.status?.processing || 0, getLanguage(),'', true),
                      formatNumberStr(collections.status?.rejected || 0, getLanguage(),'', true)
                    ],
                    "type": ['validated','creation','processing','rejected'],
                    "color": ["#4CAF50","#FF9800","#2196F3","#F44336"],
                  },
                  "link": [
                    Routes.withParameters(COLLECTION_LIST, [{status: "validated"}]),
                    Routes.withParameters(COLLECTION_LIST, [{status: "creation"}]),
                    Routes.withParameters(COLLECTION_LIST, [{status: "processing"}]),
                    Routes.withParameters(COLLECTION_LIST, [{status: "rejected"}]),
                  ]
                }}
                sum={{
                  'title':t('collectionSum'),
                  'value':formatNumberStr(collections.collection_sum || 0, getLanguage())
                }}
                donut={{
                  "series": statusDonutSeries,
                  "labels": [t('validated'), t('inCreation'), t('inProcessing'), t('rejected')],
                  "colors": ["#4CAF50", "#FF9800", "#2196F3", "#F44336"],
                  "title": t('StatementReceipts'),
                }}
                area={{
                  "series": compare ?
                    [
                      {name: t("collections"), data: getEvolution(collections.evolution)},
                      {name: t("redemptions"), data: getEvolution(redemptions.evolution)},
                    ]
                  : [{name: t("monthlyCollections"), data: getEvolution(collections.evolution)}],
                  "colors": compare ? ["#4CAF50", "#FF9800"] : ["#4CAF50"],
                  "title": t('MonthlyEvolution'),
                  "yTitle": t('amount'),
                  "granularity": granularity,
                  "compare": compare,
                }}

                compareCheckbox={
                  <FormGroup>
                    <FormControlLabel onChange={()=>{setCompare(!compare)}} control={<Checkbox/>} label={t('compareRedemption')} labelPlacement="start"/>
                  </FormGroup>
                }

                filterReady={filterReady}

                filterAreaChart={
                  <FilterAreaChart
                    setDateRange={setDateRange}
                    setGranularity={setGranularity}
                    setProviders={setProviders}
                  />
                }
              />
            </>
        ): null
       : (
        <IndicatorSkeleton columnsNumber={4} />
      )}
    </>
  );
};

export default CollectionIndicators;