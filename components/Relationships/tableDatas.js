import {formatNumber, getStatusBadge, toCaptitalize} from "@/utils";
import moment from "moment/moment";
import {Stack, Tooltip} from "@mui/material";
import Link from "next/link";
import Routes from "@/utils/routes";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "@/styles/accountListing.module.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import React from "react";
import {CONTRACT_SHOW, CONTRACT_UPDATE} from "@/utils/routes/routes";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {useTranslation} from "react-i18next";

export  let tableDataSouscriptions = (_data, context, t) => {
  // const {t} = useTranslation();
  return _data?.subscriptions?.map(subscription => ({

    id: subscription.uid,
    code: subscription.code,
    prime: formatNumber(subscription.prime),
    accessory: subscription.accessory,
    amount: formatNumber(subscription.amount),
    duration: subscription.duration,
    provider: (subscription.provider?.last_name || '') + " " + (subscription.provider?.first_name || ''),
    subscriber: (subscription.subscriber?.person?.last_name || '') + " " + (subscription.subscriber?.person?.first_name || ''),
    status: getStatusBadge(subscription.status, t),
    date: moment(subscription.created_at).format("DD/MM/YYYY HH:mm:ss"),
    actions: (
      <Stack direction="row" spacing={1}>
        <Link href={Routes.SOUSCRIPTION_DETAILS(subscription.uid)}>
          <VisibilityIcon
            color="secondary"
            onClick={() => {
              context.togglePageLoading(true);
            }}
            className={styles.clickableIcon}
          />
        </Link>
        <Link href={Routes.SOUSCRIPTION_UPDATE(subscription.uid)}>
          <EditIcon
            color="primary"
            onClick={() => {
              context.togglePageLoading(true);
            }}
            className={styles.clickableIcon}
          />
        </Link>
      </Stack>
    ),
  }));
};

export  let tableDataContracts = (_data, context, t) => {
  // const {t} = useTranslation();
  return _data?.contracts?.map((contract, index) => ({
    code: contract.code,
    status: getStatusBadge(contract.status, t),
    prime: formatNumber(contract.prime),
    duration: contract.duration,
    effective_date: moment(contract.effective_date).format("DD/MM/YYYY"),
    due_date: moment(contract.due_date).format("DD/MM/YYYY"),
    actions: (
      <Stack direction="row" spacing={2}>
        <Tooltip title="Afficher les détails" placement="bottom">
          <Link href={CONTRACT_SHOW(contract.uid)}>
            <VisibilityIcon
              color="secondary"
              className={styles.clickableIcon}
            />
          </Link>
        </Tooltip>
        <Tooltip title="Modifier" placement="bottom">
          <Link href={CONTRACT_UPDATE(contract.uid)}>
            <EditIcon
              color="primary"
              className={styles.clickableIcon}
              onClick={e => context.togglePageLoading(true)}
            />
          </Link>
        </Tooltip>
      </Stack>
    ),
  }));
};