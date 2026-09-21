"use client";

import React, {useCallback, useEffect, useRef, useState} from "react";
import {deleteAccount, getAllAccounts, getNextAccountsPage} from "@/services/accountService";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {useTheme} from "@mui/material/styles";
import Link from "next/link";
import styles from "@/styles/accountListing.module.scss";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {ACCOUNT_DETAILS_PAGE, ACCOUNT_UPDATE_PAGE, CREATE_ACCOUNT_PAGE, LOGIN_PAGE} from "@/utils/routes/routes";
import Toast from "@/utils/toast";
import MUIDataTable from "mui-datatables";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Tooltip from "@mui/material/Tooltip";
import ActivityIndicator from "@/components/ActivityIndicator";
import {useParams, useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import AccountService from "@/services/Account";
import {displayHttpError} from "@/utils/api";
import {Visibility} from "@mui/icons-material";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import authService from "@/services/AuthService";
import {getStatusBadge} from "@/utils";
import TableUtils from "@/utils/table";
import ConfirmModal from "@/components/ConfirmModal";
import Export from "@/services/Export";

const tableUtils = new TableUtils();

const AccountListing = () => {
  const {t} = useTranslation();
  const [accounts, setAccounts] = useState({});
  const [inProgress, setInProgress] = useState(false);
  const [accountUid, setAccountUid] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [pagination, setPagination] = useState(undefined);
  const [isChangingPage, setIsChangingPage] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [qAccount, setqAccount] = useState("");
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const {token, authorizations, currentAccess, role_authorizations} =
    JSON.parse(localStorage.getItem("storedValues")) || {};
  const context = useAppContext();
  const habilitations = authorizations || role_authorizations || [];
  const [statut, setStatut] = useState("");
  const [tableTitle, setTableTitle] = useState(t("allAccounts"));
  const [ready, setReady] = useState(false);
  const [activeButtonIndex, setActiveButtonIndex] = useState(1);
  const param = UtilMethods.getStatusParam();
  const downloadRef = useRef(null);

  const actionButtonLabels = [
    {id: 1, label: t("all"), status: "", tableTitle: t("allAccounts")},
    {
      id: 2,
      label: AccountService.equivalent(t).active,
      status: AccountService.ACTIVE,
      tableTitle: t("enabledAccounts"),
    },
    {
      id: 3,
      label: AccountService.equivalent(t).inactive,
      status: AccountService.INACTIVE,
      tableTitle: t("disabledAccounts"),
    },
  ];

  const columns = [
    {name: "id", label: t("uid"), options: {display: false}},
    {name: "nom", label: t("lastName")},
    {name: "prenom", label: t("firstName")},
    {name: "numeroTelephone", label: t("phoneNumber")},
    {name: "eMail", label: t("email")},
    {
      name: "status",
      label: t("status"),
      options: {
        customBodyRender: _value => getStatusBadge(_value, t),
      },
    },
    {name: "actions", label: t("actions"), options: {filter: false, sort: false}, unexport: true},
  ];

  const accountAuthorizations = habilitations.filter(
    authorization =>
      authorization.permission.label === "create account" ||
      authorization.permission.label === "delete account" ||
      authorization.permission.label === "read account" ||
      authorization.permission.label === "update account",
  );
  const authAccount = accountUuid => {
    const accesses = JSON.parse(localStorage.getItem("storedValues"))?.access;
    return accesses.find(access => access.account.uid === accountUuid);
  };

  const getAccounts = useCallback(
    async (_page, q, statut, _perPage= 10) => {
      const result = await AccountService.get(token, _page, q, statut, _perPage);
      if (!result.error) {
        setAccounts(result.data.accounts);
        setPagination(result.data.pagination);
        setCurrentPage(result.data.pagination.current_page);
        tableUtils.setRecord(result.data.accounts);
        setReady(true);
      } else {
        displayHttpError(result.error, router);
      }
    },
    [router, token],
  );

  useEffect(() => {
    if (param !== null) {
      setStatut(param);

      const matchingButton = actionButtonLabels.find(action => action.status === param);
      const indexTable = matchingButton?.id || 1;

      handleActiveFilter(indexTable, param);
    }
  }, []);
  // get all accounts
  useEffect(() => {
    getAccounts(currentPage, qAccount, statut);
  }, [getAccounts]);

  // on delete icon click
  const handleDeleteAccount = async () => {
    try {
      // start delete progress indicator
      setInProgress(true);

      const result = await deleteAccount(token, accountUid);

      // success message
      Toast.success(result.message);
      // update account list
      setAccounts(accounts.filter(account => account.uid !== accountUid));
    } catch (e) {
      authService.formatFetchErrorMsgAndLogout(e.message, context, router);
    } finally {
      setInProgress(false);
      setDeleteModal(false);
    }
  };

  //  table data
  let tableData = records => {
    return records?.map(account => {
      return {
        id: account.uid,
        nom: account.last_name,
        prenom: account.first_name,
        eMail: account.email,
        numeroTelephone: account.phone,
        status: account.status,
        actions: !(
          String(account.first_name || "").includes("System") && String(account.last_name || "").includes("SYSTEM")
        ) && (
          <Stack direction="row" spacing={1}>
            {UtilMethods.getHabilitations(authorizations, "account").canRead && (
              <Tooltip title={t("viewDetails")} placement="bottom">
                <Link href={ACCOUNT_DETAILS_PAGE(account.uid)}>
                  <Visibility
                    color="primary"
                    className={styles.clickableIcon}
                    onClick={e => context.togglePageLoading(true)}
                  />
                </Link>
              </Tooltip>
            )}
            {UtilMethods.getHabilitations(authorizations, "account").canUpdate && (
              <Tooltip title={t("edit")} placement="bottom">
                <Link href={ACCOUNT_UPDATE_PAGE(account.uid)}>
                  <EditIcon
                    color="primary"
                    className={styles.clickableIcon}
                    onClick={e => context.togglePageLoading(true)}
                  />
                </Link>
              </Tooltip>
            )}
            {UtilMethods.getHabilitations(authorizations, "account").canDelete && !authAccount(account.uid) && (
              <Tooltip title={t("delete")} placement="bottom">
                <DeleteIcon
                  onClick={() => {
                    setAccountUid(account.uid);
                    setDeleteModal(true);
                  }}
                  color="error"
                  className={styles.clickableIcon}
                />
              </Tooltip>
            )}
          </Stack>
        ),
      };
    });
  };

  const handleActiveFilter = (index, status) => {
    // focus active filter
    setActiveButtonIndex(index);
    setStatut(status);

    if (status !== "") {
      setTableTitle(actionButtonLabels.find(actionButton => actionButton.id === index).tableTitle);
    } else {
      setTableTitle(t("allAccounts"));
    }
  };

  const handleDownloadResources = async () => await Export.download(token, context, router, 'accounts')

  return (
    <>
      {accounts === undefined || pagination === undefined ? (
        <TableSkeleton rowsNumber={10} />
      ) : (
        <>
          <Box sx={{mt: 2, mb: 2}}>
            <div className="__flex-row">
              <Stack
                direction="row"
                width="100%"
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                spacing={4}
                className="action-buttons-container">
                <Box className="status-filter-button-group">
                  {actionButtonLabels.map(actionButton => {
                    return (
                      <Button
                        className={`status-filter-button ${activeButtonIndex === actionButton.id ? "active" : ""}`}
                        variant="contained"
                        disabled={!ready || activeButtonIndex === actionButton.id}
                        onClick={() => handleActiveFilter(actionButton.id, actionButton.status)}
                        key={actionButton.id}>
                        {actionButton.label}
                      </Button>
                    );
                  })}
                </Box>

                <Stack direction={{ xs: 'column', sm: 'row' }}
                       spacing={{ xs: 1, sm: 2, md: 4 }}
                >
                  <Button
                      variant="contained"
                      onClick={() => {
                        context.togglePageLoading(true);
                        router.push(CREATE_ACCOUNT_PAGE);
                      }}
                      className="__flex_item __right __text-transform-none">
                    {t("createANewAccount")}
                  </Button>
                  {UtilMethods.getHabilitations(authorizations, 'account').canExport && <Button
                    style={{marginLeft: '12px'}}
                    variant="outlined"
                    onClick={handleDownloadResources}
                    className="__flex_item __right __text-transform-none">
                    {t('exportExcel')}
                  </Button>}
                </Stack>
              </Stack>
            </div>
          </Box>
          <MUIDataTable
            title={tableTitle}
            className="brMd"
            options={{
              onDownload: () => {
                const fn = async () => {
                  if (tableUtils.isRowsSelected()) {
                    context.togglePageLoading(true);
                    await tableUtils.handleDownload(columns, tableData, true, AccountService.get);
                    context.togglePageLoading(false);
                  } else {
                    downloadRef.current?.open();
                  }
                };
                fn();
                return false;
              },
              onTableChange: async (action, tableState) => {
                await tableUtils.onTableChange(
                  action,
                  tableState,
                  setAccounts,
                  _search => {
                    getAccounts(1, _search, undefined);
                  },
                  context.togglePageLoading,
                  getAccounts,
                  tableData,
                  "accounts",
                );
              },
              rowsPerPageOptions: [10, 20, 50, 100, 200],
              setTableProps: () => {
                return {
                  size: "medium",
                };
              },
              serverSide: true,
              print: false,
              selectToolbarPlacement: "none",
              elevation: 1,
              rowsPerPage: pagination?.per_page ?? 10,
              count: pagination?.total ? pagination?.total : null,
              textLabels: textLabels,
            }}
            columns={columns}
            data={tableData(accounts)}
          />
          {/*<ActivityIndicator visible={isChangingPage} />*/}
          <Dialog
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            aria-labelledby="alert-delete-access"
            aria-describedby="confirm-delete-access">
            <ActivityIndicator visible={inProgress} />
            <DialogTitle id="alert-dialog-title">
              <Stack color="warning" direction="rows" alignItems="center">
                <WarningAmberIcon color="error" fontSize="medium" sx={{mr: 1}} />
                <Typography variant="h4" component="p" color="error.main">
                  {t("warning")}
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t("areYouSureYouWantToDeleteThisItem")}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => setDeleteModal(false)}>
                {t("cancel")}
              </Button>
              <Button variant="contained" onClick={handleDeleteAccount} color="error">
                {t("delete")}
              </Button>
            </DialogActions>
          </Dialog>
          <ConfirmModal
            ref={downloadRef}
            title={t("confirmation")}
            content={t("areYouSureYouWantToExportAllData")}
            onConfirm={async () => {
              downloadRef.current?.toggleLoader(true);
              await tableUtils.handleDownload(columns, tableData, true, AccountService.get);
              downloadRef.current?.toggleLoader(false);
              downloadRef.current?.close();
            }}
            onCancel={() => {
              tableUtils.handleDownload(columns, tableData);
            }}
          />
        </>
      )}
    </>
  );
};

export default AccountListing;
