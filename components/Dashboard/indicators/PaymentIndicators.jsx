/* eslint-disable react-hooks/exhaustive-deps */
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import {PAYMENT_LIST} from "@/utils/routes/routes";
import {formatNumberStr, getLanguage, getToken} from "@/utils";
import { displayHttpError } from "@/utils/api";
import DashboardService from "@/services/DashboardService";
import IndicatorSkeleton from "@/components/Dashboard/indicators/IndicatorSkeleton";
import IndicatorPattern from "@/components/Dashboard/indicators/indicatorPattern";
import Routes from "@/utils/routes";

const PaymentIndicators = ({ focus = true, onGotData }) => {
  const [payments, setPayments] = useState(null);
  const [ready, setReady] = useState(false);
  const token = getToken();
  const router = useRouter();
  const { t } = useTranslation();

  // Fetch payment data
  const getRecord = useCallback(async () => {
    const result = await DashboardService.payment(token);
    if (result.error == null) {
      setPayments(result.data);
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
        payments ? (
            <IndicatorPattern
              card={{
                "name": t('payments'),
                "data":{
                  "title": [t('validated'), t('initiated'), t('pending'), t('rejected')],
                  "value": [
                    formatNumberStr(payments.status?.validated || 0, getLanguage(), '', true),
                    formatNumberStr(payments.status?.initiated || 0, getLanguage(), '', true),
                    formatNumberStr(payments.status?.pending || 0, getLanguage(), '', true),
                    formatNumberStr(payments.status?.rejected || 0, getLanguage(), '', true)
                  ],
                  "type": ['validated','creation','processing','rejected'],
                  "color": ["#4CAF50","#FF9800","#2196F3","#F44336"],
                 },
                "link": [
                  Routes.withParameters(PAYMENT_LIST, [{status: "validated"}]),
                  Routes.withParameters(PAYMENT_LIST, [{status: "initiated"}]),
                  Routes.withParameters(PAYMENT_LIST, [{status: "pending"}]),
                  Routes.withParameters(PAYMENT_LIST, [{status: "rejected"}]),
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

export default PaymentIndicators;