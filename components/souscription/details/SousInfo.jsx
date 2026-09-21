"use client";
import React, {useEffect} from "react";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import {Divider, Skeleton, Typography} from "@mui/material";
import MDTypography from "@/material/components/MDTypography";
import InfoItem from "./InfoItem";
import {formatNumber, getStatusBadge, toCaptitalize} from "@/utils";
import moment from "moment";
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
import "@/styles/souscription.scss";
import {useTranslation} from "react-i18next";

/**
 *
 * @param record {SubscriptionModel}
 * @returns {Element}
 * @constructor
 */
let viewer;

const SousInfo = ({record}) => {
    const {t} = useTranslation();
  useEffect(() => {
    if (record != null) {
      viewer = new Viewer(document.getElementById("cniFiles"));
    }
  }, [record]);
  if (record == null) {
    return (
      <MDBox bgColor="white" className="__box" mb={2}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6} lg={6} xl={6} className="__item-separator">
            <Skeleton variant="rectangular" height={200} />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <Skeleton variant="rectangular" height={200} />
          </Grid>
        </Grid>
      </MDBox>
    );
  } else {
    const {subscribers, life_beneficiaries, death_beneficiaries, person_contacts, provider, payment_system, product} =
      record;
    const subscriber = subscribers[0];

    return (
      <MDBox bgColor="white" className="__box" mb={2}>
        <Grid container spacing={2}>
          <Grid xs={12} md={6} lg={6} xl={6} className="__item-separator">
            <MDTypography color="text" variant="h6">
                {t("subscriptionInformation")}
            </MDTypography>
            <InfoItem
              label={t("code")}
              value={record.code}
              second={{
                label: `${t("status")}`,
                value: getStatusBadge(record.status, t),
              }}
            />
            <InfoItem
              label={t("premium")}
              value={formatNumber(record.prime, "fr")}
              second={{
                label: `${t("accessory")}`,
                value: formatNumber(record.accessory, "fr"),
              }}
            />
            <InfoItem
              label={t("duration")}
              value={`${record.duration} ${t("year")}`}
              second={{
                label: `${t("effectiveDate")}`,
                value: record.effective_date ? moment(record.effective_date).format("llll") : "",
              }}
            />
            <InfoItem label={t("provider")} value={`${provider?.last_name || ''} ${provider?.first_name || ''}`} />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <MDTypography color="text" variant="h6">
                {t("subscriberInformation")}
            </MDTypography>
            <InfoItem
              label={t("fullName")}
              value={`${subscriber.person.last_name} ${subscriber.person.first_name}`}
              second={{
                label: `${t("emailAddress")}`,
                value: subscriber.person.email,
              }}
            />
            <InfoItem
              label={t("primaryPhone")}
              value={subscriber.person.main_phone}
              second={{
                label: `${t("secondaryPhone")}`,
                value: subscriber.person.secondary_phone,
              }}
            />
            <InfoItem
              label={t("birthdate")}
              value={moment(subscriber.person.birth_date).format("DD/MM/YYYY")}
              second={{
                label: `${t("birthplace")}`,
                value: subscriber.person.birth_place,
              }}
            />
            <InfoItem
              label={t("NIUnumber")}
              value={subscriber.person.nui_number}
              second={{
                label: `${t("gender")}`,
                value: subscriber.person.gender ? subscriber.person.gender.label : "",
              }}
            />
            <InfoItem
              label={t("IDCardNumber")}
              value={subscriber.person.cni_number}
              second={{
                label: `${t("IDCardExpirationDate")}`,
                value: moment(subscriber.person.cni_expired_at).format("DD/MM/YYYY"),
              }}
            />
            <div className="__flex-row __two" id="cniFiles">
              <div>
                <MDTypography color="secondary" variant="button" fontWeight="medium">
                    {t("IDCardFront")}
                </MDTypography>
                <br />
                <img
                  onClick={() => viewer.show()}
                  src={subscriber.person.cni_file_main}
                  alt="Image"
                  className="__sous-img"
                />
              </div>
              <div>
                <MDTypography variant="button" fontWeight="medium">
                    {t("IDCardBack")}
                </MDTypography>
                <br />
                <img
                  onClick={() => viewer.show()}
                  src={subscriber.person.cni_file_secondary}
                  alt="Image"
                  className="__sous-img"
                />
              </div>
            </div>
          </Grid>
        </Grid>
      </MDBox>
    );
  }
};

export default SousInfo;
