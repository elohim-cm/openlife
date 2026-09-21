"use client";

import {useAppContext} from "@/contexts/appContext";
import React, {useCallback, useEffect, useState} from "react";
import {getStatusBadge, getToken, getUid} from "@/utils";
import {useRouter} from "next/navigation";
import {displayHttpError} from "@/utils/api";
import MDTypography from "@/material/components/MDTypography";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import InfoItem from "@/components/souscription/details/InfoItem";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {Button} from "@mui/material";
import ActivityIndicator from "@/components/ActivityIndicator";
import {useTranslation} from "react-i18next";
import AuditService from "@/services/Audit";
import {
  ACCOUNT_DETAILS_PAGE,
  COMMISSION_READ,
  CONTRACT_SHOW,
  PROVIDER_READ,
} from "@/utils/routes/routes";
import Routes from "@/utils/routes";
import {FileOpenRounded} from "@mui/icons-material";

const AuditTrackDetailsPage = () => {
  const {t} = useTranslation();
  const [record, setRecord] = React.useState(null);
  const [ready, setReady] = React.useState(false);
  const [inProgress, setInProgress] = React.useState(false);
  const [device_info, setDevice_info] =  useState(null);
    const [oldValues, setOldValues] =  useState(null);
    const [newValues, setNewValues] =  useState(null);
  const token = getToken();
  const context = useAppContext();
  const router = useRouter();

  useEffect(() => {
    context.togglePageLoading(false);
  }, []);

  const getRecord = useCallback(
    async _uid => {
      setInProgress(true)
      const result = await AuditService.show(token, getUid());
      console.log("Result::: ", result);
      setInProgress(false)
      if (result.error == null) {
        setRecord(result.log);
        setDevice_info(JSON.parse(result?.log?.device_info ?? "{}"))
        setOldValues(JSON.parse(result?.log?.old_value ?? "{}"))
        setNewValues(JSON.parse(result?.log?.new_value ?? "{}"))
        setReady(true);
      } else {
        displayHttpError(result.error, router);
      }
    },
    [router, token],
  );


  React.useEffect(() => {
    getRecord(getUid());
  }, [getRecord]);

  return (
    <MDBox mt={2} sx={{position: "relative"}}>
      <ActivityIndicator visible={inProgress} />
      <MDBox sx={{display: "flex", alignItems: "center", my: 2}} mb={2}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => {
            context.togglePageLoading(true);
            router.back();
          }}>
          {t("back")}
        </Button>
        {(ready && record?.item && record?.item !== 'unknown') && <Button
            variant="contained"
            startIcon={<FileOpenRounded/>}
            color="secondary"
            onClick={() => {
              const href = handleRedirectToDetailItem(record?.type, record?.item);
              context.togglePageLoading(true)
              router.push(href)
            }}
            style={{marginLeft:"12px"}}
        >
          {t("consultItem")}
        </Button>}
      </MDBox>
      {ready ? (
        <div>
          <MDBox className="__box" style={{padding: 0}} mb={2}>
            <MDBox bgColor="white" mb={2}  p={2} borderRadius={12}>
              <MDTypography variant="h5" mb={1}>
                {t("primaryInformations")}
              </MDTypography>
              <Grid container spacing={2}>
                <Grid xs={12} md={12} lg={12} xl={12}>
                  <InfoItem
                      label={t("type")}
                      value={record.type}
                      second={{
                        label: `${t("action")}`,
                        value: record.action,
                      }}
                  />
                  <InfoItem
                      label={t("page")}
                      value={record.page}
                      second={{
                        label: `${t("result")}`,
                        value: getStatusBadge(record.result, t),
                      }}
                  />
                  <InfoItem
                      label={t("error")}
                      value={record.error}
                      second={{
                        label: `${t("description")}`,
                        value: record.description,
                      }}
                  />
                  <InfoItem
                      label={t("date")}
                      value={record.created_at}
                  />
                </Grid>
              </Grid>
            </MDBox>
            <MDBox bgColor="white" mb={2}   p={2} borderRadius={12}>
              <MDTypography variant="h5" mb={1}>
                {t("deviceInformation")}
              </MDTypography>
              <Grid container spacing={2}>
                <Grid xs={12} md={12} lg={12} xl={12}>
                  <InfoItem
                      label={t("userAgent")}
                      value={device_info['User-Agent']}
                      second={{
                        label: `${t("ipAddress")}`,
                        value: device_info['IP Address'],
                      }}
                  />
                  <InfoItem
                      label={t("acceptlanguage")}
                      value={device_info['Accept-Language']}
                      second={{
                        label: `${t("referer")}`,
                        value: device_info['Referer'],
                      }}
                  />
                  <InfoItem
                      label={t("host")}
                      value={device_info['Host']}
                  />
                </Grid>
              </Grid>
            </MDBox>
            <MDBox bgColor="white" mb={2}   p={2} borderRadius={12} style={{wordBreak:"break"}}>
              <MDTypography variant="h5" mb={1}>
                {t("modifierInformations")}
              </MDTypography>
              <Grid container spacing={2}>
                <Grid xs={12} md={12} lg={12} xl={12}>
                  <InfoItem
                      label={t("name")}
                      value={`${record.user?.last_name} ${record.user?.first_name}`}
                      second={{
                        label: `${t("email")}`,
                        value: record.user?.email,
                      }}
                  />
                  <InfoItem
                      label={t("phone")}
                      value={record.user?.phone}
                  />
                </Grid>
              </Grid>
            </MDBox>
              {(oldValues || newValues) && <MDBox bgColor="white" mb={2} p={2} borderRadius={12}>
                  <MDTypography variant="h5" mb={1}>
                      {t("values")}
                  </MDTypography>
                  <Grid container spacing={2}>
                      <Grid xs={12} md={6} lg={6} xl={6}   className="__item-separator">
                          <MDTypography variant="h6" mb={1}>
                              {t("oldValues")}
                          </MDTypography>
                        {Object.entries(flattenData(oldValues)).map(([key, value], index) => (
                            <InfoItem
                                key={index}
                                label={key}
                                value={value}
                            />
                        ))}
                      </Grid>
                      <Grid xs={12} md={6} lg={6} xl={6}>
                          <MDTypography variant="h6" mb={1}>
                              {t("newValues")}
                          </MDTypography>
                        {Object.entries(flattenData(newValues)).map(([key, value], index) => (
                            <InfoItem
                                key={index}
                                label={key}
                                value={value}
                            />
                        ))}
                      </Grid>
                  </Grid>
              </MDBox>}
          </MDBox>
        </div>
      ) : (
        <div>{t("inProgress...")}</div>
      )}
    </MDBox>
  );
};

const flattenData = (obj, parent = '', res = {}) => {
  for (let key in obj) {
    let propName = parent ? `${parent}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null) {
      flattenData(obj[key], propName, res);
    } else {
      res[propName] = obj[key];
    }
  }
  return res;
};

const getChangeableKeysObject = (_oldValue, _newValue) => {

  const changes = {
    old_value: {},
    new_value: {}
  };

  const compareObjects = (obj1, obj2, parentKey = '') => {
    for (const key in obj1) {
      const currentKey = parentKey ? `${parentKey}.${key}` : key;
      if (obj1[key] !== obj2[key]) {
        if (typeof obj1[key] === 'object' && typeof obj2[key] === 'object' && obj1[key] !== null && obj2[key] !== null) {
          compareObjects(obj1[key], obj2[key], currentKey);
        } else {
          changes.old_value[currentKey] = obj1[key];
          changes.new_value[currentKey] = obj2[key];
        }
      }
    }
  };

  compareObjects(_oldValue, _newValue);
  return changes;
};

const handleRedirectToDetailItem = (_type, _item) =>{
  switch (_type) {
    case "contract":
      return Routes.CONTRACT_DETAILS(_item)
    case "provider":
      return PROVIDER_READ(_item)
    case "account":
      return ACCOUNT_DETAILS_PAGE(_item)
    case "commission":
      return COMMISSION_READ(_item)
    case "redemption":
      return Routes.RACHAT_DETAILS(_item)
    case "subscription":
      return Routes.SOUSCRIPTION_DETAILS(_item)
    case "collection":
      return Routes.COLLECTION_DETAILS(_item)
  }
}

export default AuditTrackDetailsPage;
