/* eslint-disable react-hooks/exhaustive-deps */
import React, {useCallback, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";

import {formatNumberStr, getLanguage, getToken} from "@/utils";
import { displayHttpError } from "@/utils/api";
import DashboardService from "@/services/DashboardService";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
import moment from "moment/moment";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";
import Routes from "@/utils/routes";
import {BUYBACK_LIST} from "@/utils/routes/routes";
import FilterAreaChart from "@/components/FilterAreaChart";

const RedemptionIndicators = ({focus = true, onGotData}) => {
  const [redemptions, setRedemptions] = useState(null);
  const [ready, setReady] = useState(false);
  const token = getToken();
  const router = useRouter();
  const { t } = useTranslation();

  const defaultEndDate = new Date();
  defaultEndDate.setFullYear(defaultEndDate.getFullYear()-1);
  const [dateRange, setDateRange] = useState({
    startDate: defaultEndDate,
    endDate: new Date(),
  });
  const [granularity, setGranularity] = useState('MONTHLY');
  const [providers, setProviders] = useState(null);
  const [filterReady, setFilterReady] = useState(false);

  const getRecord = useCallback(async () => {
    let params = {};
    setFilterReady(false);
    if(dateRange) {
      params.filters = {
        start_date: moment(dateRange.startDate).format("YYYY-MM-DD"),
        end_date: moment(dateRange.endDate).format("YYYY-MM-DD"),
      };
      params.granularity = granularity;
    }
    if(providers) {
      params.providers = providers.uid;
    }
    const result = await DashboardService.redemption(token, params);
    if (result.error == null) {
      setRedemptions(result.data);
      setReady(true);
      setFilterReady(true);
      onGotData(result.data);
    } else {
      displayHttpError(result.error, router);
      onGotData();
    }
  }, [router, token, dateRange, granularity, providers]);

  useEffect(() => {
    if (focus) {
      getRecord();
    }
  }, [focus, getRecord, dateRange, granularity, providers]);

  const getRedemption= useCallback((data)=>{
    let redemptions=[];
    for (const dataKey in data) {
      redemptions.push({
        x: moment(dataKey).format('yyyy-MM-DD'),
        y: data[dataKey],
      });
    }
    return redemptions.reverse();
  },[redemptions]);

  // Series for status donut chart
  const statusDonutSeries = redemptions
    ? [
      redemptions.status?.validation || 0,
      redemptions.status?.validated || 0,
      redemptions.status?.payment || 0,
      redemptions.status?.acceptance || 0,
      redemptions.status?.approval || 0,
      redemptions.status?.confirmation || 0,
      redemptions.status?.cancelled || 0,
      redemptions.status?.rejected || 0,
    ]
    : [];
  // Series for status Card with format number to Str
  const cardSeries = redemptions
    ? [
      formatNumberStr(redemptions.status?.validation || 0, getLanguage(),'', true),
      formatNumberStr(redemptions.status?.validated || 0, getLanguage(),'', true),
      formatNumberStr(redemptions.status?.payment || 0, getLanguage(),'', true),
      formatNumberStr(redemptions.status?.acceptance || 0, getLanguage(),'', true),
      formatNumberStr(redemptions.status?.approval || 0, getLanguage(),'', true),
      formatNumberStr(redemptions.status?.confirmation || 0, getLanguage(),'', true),
      formatNumberStr(redemptions.status?.cancelled || 0, getLanguage(),'', true),
      formatNumberStr(redemptions.status?.rejected || 0, getLanguage(),'', true)
    ]
    : [];

  return (
    <>
      {ready ?
        redemptions ?(
          <IndicatorPattern
            card={{
              "name": t('redemptions'),
              "data":{
                "title": [
                  t("validation"),
                  t('validated'),
                  t("inPayment"),
                  t("acceptance"),
                  t("approval"),
                  t("confirmation"),
                  t("cancelled"),
                  t('rejected')
                ],
                "value": cardSeries,
                "type": ['validation', 'validated', 'payment', 'acceptance', 'approval', 'confirmation', 'cancelled', 'rejected'],
                "color": ["blue", "green", "orange", "cyan", "violet", "green2", "gray", "red"],
              },
              "link": [
                Routes.withParameters(BUYBACK_LIST, [{status: "validation"}]),
                Routes.withParameters(BUYBACK_LIST, [{status: "validated"}]),
                Routes.withParameters(BUYBACK_LIST, [{status: "payment"}]),
                Routes.withParameters(BUYBACK_LIST, [{status: "acceptance"}]),
                Routes.withParameters(BUYBACK_LIST, [{status: "approval"}]),
                Routes.withParameters(BUYBACK_LIST, [{status: "confirmation"}]),
                Routes.withParameters(BUYBACK_LIST, [{status: "cancelled"}]),
                Routes.withParameters(BUYBACK_LIST, [{status: "rejected"}]),
              ]}}
            donut={{
              "series": statusDonutSeries,
              "labels": [
                t("validation"),
                t('validated'),
                t("inPayment"),
                t("acceptance"),
                t("approval"),
                t("confirmation"),
                t("cancelled"),
                t('rejected')
              ],
              "colors": ["blue", "green", "orange", "cyan", "violet", "green2", "gray", "red"],
              "title": t('StatementRedemptions'),
            }}
            sum={{
              'title':t('redemptionVal'),
              'value':formatNumberStr(redemptions.redemption_sum || 0, getLanguage())
            }}
            area={{
              "series": [{name: t("monthlyRedemptions"), data: getRedemption(redemptions.evolution)}],
              "colors": ["#4CAF50"],
              "title": t('MonthlyEvolution'),
              "yTitle": t('amount'),
              "granularity": granularity,
            }}

            filterReady={filterReady}

            filterAreaChart={
              <FilterAreaChart
                setDateRange={setDateRange}
                setGranularity={setGranularity}
                setProviders={setProviders}
              />
            }
          />
        ) : null
       : (
        <IndicatorSkeleton columnsNumber={4} />
      )}
    </>
  );
};

export default RedemptionIndicators;
