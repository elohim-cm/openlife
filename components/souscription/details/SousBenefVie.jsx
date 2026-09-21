"use client";
import React from "react";
import MDBox from "@/material/components/MDBox";
import Grid from "@mui/material/Unstable_Grid2";
import {Divider, Skeleton, Typography} from "@mui/material";
import MDTypography from "@/material/components/MDTypography";
import InfoItem from "./InfoItem";
import {formatNumber, toCaptitalize} from "@/utils";
import moment from "moment";
import {useTranslation} from "react-i18next";

/**
 *
 * @param item {{uid: string, person: {uid: string, last_name: string, first_name: string, main_phone: string, birth_place: string, nui_number: string, cni_number: string}}}
 * @param index {int}
 * @constructor
 */
const Benef = ({item, index}) => {
    const {t} = useTranslation();
  return (
    <Grid xs={12} md={6} lg={6} xl={6} className={`${index % 2 === 0 ? "__item-separator" : ""}`}>
      <MDTypography color="text" variant="h6">
          {t("beneficiaryNumber")} {index + 1}
      </MDTypography>
      <InfoItem label={t("filiation")} value={item.affiliation ? item.affiliation.label : "Moi-même"} />
      <InfoItem
        label={t("fullName")}
        value={`${item.person.last_name} ${item.person.first_name}`}
        second={{
          label: `${t("emailAddress")}`,
          value: item.person.email ?? "",
        }}
      />
      <InfoItem
        label={t("primaryPhone")}
        value={item.person.main_phone}
        second={{
          label: `${t("secondaryPhone")}`,
          value: item.person.secondary_phone,
        }}
      />
      <InfoItem
        label={t("birthdate")}
        value={item.person.birth_date ? moment(item.person.birth_date).format("DD/MM/YYYY") : ""}
        second={{
          label: `${t("birthplace")}`,
          value: item.person.birth_place,
        }}
      />
    </Grid>
  );
};

/**
 *
 * @param record {{uid: string, person: object}[]|any}
 * @returns {Element}
 * @constructor
 */
const SousBenef = ({record}) => {
    const {t} = useTranslation();
  if (record == null) {
    return (
      <MDBox bgColor="white" className="__box" mb={3}>
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
    return (
      <MDBox bgColor="white" className="__box" mb={3}>
        <Grid container spacing={2}>
          {record.map((item, index) => (
            <Benef key={index} item={item} index={index} />
          ))}
        </Grid>
      </MDBox>
    );
  }
};

export default SousBenef;
