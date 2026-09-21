"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { deleteAccount } from "@/services/accountService";
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
  Tooltip,
  IconButton
} from "@mui/material";
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  WarningAmber as WarningAmberIcon,
  CloudDownload,
  Visibility
} from "@mui/icons-material";
import { useTheme } from "@mui/material/styles";
import Link from "next/link";
import styles from "@/styles/accountListing.module.scss";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import { ACCOUNT_DETAILS_PAGE, ACCOUNT_UPDATE_PAGE, CREATE_ACCOUNT_PAGE } from "@/utils/routes/routes";
import Toast from "@/utils/toast";
import ActivityIndicator from "@/components/ActivityIndicator";
import { useParams, useRouter } from "next/navigation";
import { useAppContext } from "@/contexts/appContext";
import AccountService from "@/services/Account";
import { displayHttpError } from "@/utils/api";
import { useTranslation } from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import authService from "@/services/AuthService";
import { getLanguage, getStatusBadge, handleDownloadCsv } from "@/utils";
import TableUtils from "@/utils/table";
import ConfirmModal from "@/components/ConfirmModal";
import Export from "@/services/Export";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable
} from "material-react-table";
import MDBox from "@/material/components/MDBox";
import { BASE_URL } from "@/utils/api/api";
import axios from "axios";
import { MRT_Localization_FR } from "material-react-table/locales/fr";
import { MRT_Localization_EN } from "material-react-table/locales/en";

const tableUtils = new TableUtils();

const AccountListing = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const router = useRouter();
  const params = useParams();
  const context = useAppContext();
  const downloadRef = useRef(null);
  const reqController = useRef(new AbortController());
  
  // State Management
  const [records, setRecords] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isRefresh, setIsRefresh] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const [inProgress, setInProgress] = useState(false);
  const [accountUid, setAccountUid] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [ready, setReady] = useState(false);
  const [reqCancelable, setReqCancelable] = useState(false);

  // Authentication & Authorization
  const { token, authorizations, role_authorizations } = JSON.parse(localStorage.getItem("storedValues")) || {};
  const habilitations = authorizations || role_authorizations || [];
  const param = UtilMethods.getStatusParam();

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

  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };

  const fetchRecord = useCallback(async () => {
    if (reqCancelable) {
      try {
        reqController.current.abort();
      } catch (e) {
        // Silently handle abort errors
      }
      setReqCancelable(false);
      reqController.current = new AbortController();
    }

    if (!records.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    const config = {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: reqController.current.signal,
    };

    const url = new URL(`${BASE_URL}/account`);
    
    // Process column filters
    const filters = (columnFilters ?? [])
      .map(column => {
        let values = new Map([[column.id, column.value]]);
        return Object.fromEntries(values);
      })
      .reduce((acc, item) => {
        acc = Object.assign(item, acc);
        return acc;
      }, {});
      
    // Process sorting
    const sortingTab = (sorting ?? [])
      .map(column => {
        let values = new Map([[column.id, column.desc]]);
        return Object.fromEntries(values);
      })
      .reduce((acc, item) => {
        acc = Object.assign(item, acc);
        return acc;
      }, {});
      
    // Set URL parameters
    url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
    url.searchParams.set("per_page", `${pagination.pageSize}`);
    url.searchParams.set("filters", JSON.stringify(filters));
    url.searchParams.set("q", globalFilter ?? "");
    url.searchParams.set("sorting", JSON.stringify(sortingTab));

    if (Object.keys(filters).length > 0 && !Object.hasOwnProperty('status')){
      UtilMethods.setStatusParam('')
      url.searchParams.set("status", '');
    }

    if(Object.keys(filters).length <= 0 && param !== null){
      url.searchParams.set("status", param);
    }
    
    try {
      setReqCancelable(true);
      const response = await axios.get(url.href, config);
      if (response.status === 200) {
        setRecords(response.data.data.accounts);
        setRowCount(response.data.data.pagination.total);
      }
      resetScroll();
    } catch (error) {
      console.error(error);
      if (error.code && error.code === "ERR_CANCELED") {
        return;
      }
      setIsError(true);
      displayHttpError(error, router);
      return;
    }
    
    setIsError(false);
    setIsLoading(false);
    setIsRefetching(false);
    setReady(true);
    setReqCancelable(false);
    reqController.current = new AbortController();
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, param, isRefresh, records.length, token]);

  // Get all accounts
  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  // Handle delete account
  const handleDeleteAccount = async () => {
    try {
      setInProgress(true);
      const result = await deleteAccount(token, accountUid);
      Toast.success(result.message);
      setIsRefresh(prev => !prev);
      router.refresh();
    } catch (e) {
      authService.formatFetchErrorMsgAndLogout(e.message, context, router);
    } finally {
      setInProgress(false);
      setDeleteModal(false);
    }
  };

  // Format table data
  const tableData = records => {
    return (records ?? []).map(account => {
      const isSystemAccount = String(account.first_name || "").includes("System") && 
                             String(account.last_name || "").includes("SYSTEM");
      
      return {
        id: account.uid,
        last_name: account.last_name,
        first_name: account.first_name,
        email: account.email,
        phone_number: account.phone,
        status: account.status,
        actions: !isSystemAccount && (
          <Stack direction="row" spacing={1}>
            {UtilMethods.getHabilitations(authorizations, "account").canRead && (
              <Tooltip title={t("viewDetails")} placement="bottom">
                <Link href={ACCOUNT_DETAILS_PAGE(account.uid)}>
                  <Visibility
                    color="primary"
                    className={styles.clickableIcon}
                    onClick={() => context.togglePageLoading(true)}
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
                    onClick={() => context.togglePageLoading(true)}
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

  // Table column definitions
  const columns = useMemo(
    () => [
      {
        accessorKey: "last_name",
        header: t("lastName"),
        size: 150,
        muiFilterTextFieldProps: () => ({
          inputProps: { placeholder: t("filter") },
        }),
      },
      {
        accessorKey: "first_name",
        header: t("firstName"),
        size: 150,
        muiFilterTextFieldProps: () => ({
          inputProps: { placeholder: t("filter") },
        }),
      },
      {
        accessorKey: "phone_number",
        header: t("phoneNumber"),
        size: 150,
        muiFilterTextFieldProps: () => ({
          inputProps: { placeholder: t("filter") },
        }),
      },
      {
        accessorKey: "email",
        header: t("email"),
        size: 150,
        muiFilterTextFieldProps: () => ({
          inputProps: { placeholder: t("filter") },
        }),
      },
      {
        accessorKey: "status",
        header: t("status"),
        Cell: ({ cell }) => getStatusBadge(cell.getValue(), t),
        size: 70,
        muiFilterTextFieldProps: () => ({
          inputProps: { placeholder: t("filter") },
        }),
        filterVariant: "select",
        filterSelectOptions: [
          { label: t("active"), value: "active" },
          { label: t("inactive"), value: "inactive" },
        ],
      },
      {
        accessorKey: "actions",
        header: t("actions"),
        size: 150,
        unexport: true,
        enableColumnFilter: false,
      },
    ],
    [t]
  );

  // Download handlers
  const handleDownloadResources = async () => await Export.download(token, context, router, "accounts");

  // Material React Table configuration
  const mrTable = useMaterialReactTable({
    columns,
    data: tableData(records),
    enableRowSelection: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    localization: getLanguage() === "fr" ? MRT_Localization_FR : MRT_Localization_EN,
    getRowId: row => row.id,
    initialState: { showColumnFilters: true, density: "compact" },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiTablePaperProps: { 
      className: "__table-expandable",
      elevation: 2,
      sx: { borderRadius: '12px', overflow: 'hidden' }
    },
    muiTableContainerProps: { 
      className: "__table-container",
      sx: { maxHeight: '70vh' } 
    },
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: t("errorLoadingData"),
        }
      : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    renderTopToolbarCustomActions: ({ table }) => (
      <Box sx={{ display: "flex", gap: "1rem", p: "8px" }}>
        {UtilMethods.getHabilitations(authorizations, "account").canUpdate && (
          <Button
            variant="contained"
            color="primary"
            startIcon={<EditIcon />}
            onClick={() => {
              context.togglePageLoading(true);
              router.push(CREATE_ACCOUNT_PAGE);
            }}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {t("createANewAccount")}
          </Button>
        )}
        {(UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) && (
          <Button 
            variant="outlined" 
            startIcon={<CloudDownload />}
            onClick={handleDownloadResources}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            {t("exportAll")}
          </Button>
        )}
      </Box>
    ),
    renderToolbarInternalActions: ({ table }) => (
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <IconButton 
          onClick={() => handleDownloadCsv(columns, records)}
          size="small"
          sx={{ color: theme.palette.primary.main }}
        >
          <CloudDownload />
        </IconButton>
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Box>
    ),
  });

  return (
    <>
      {!ready ? (
        <TableSkeleton rowsNumber={13} />
      ) : (
        <>
          <Box sx={{ mb: 2 }}></Box>
          <MDBox 
            bgColor="white" 
            mb={3} 
            sx={{ 
              borderRadius: "12px",
              boxShadow: "0 4px 20px 0 rgba(0,0,0,0.05)"
            }}
          >
            <MaterialReactTable table={mrTable} />
          </MDBox>
          
          {/* Delete Confirmation Dialog */}
          <Dialog
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            PaperProps={{
              sx: { borderRadius: '12px' }
            }}
            aria-labelledby="alert-delete-access"
            aria-describedby="confirm-delete-access"
          >
            <ActivityIndicator visible={inProgress} />
            <DialogTitle id="alert-dialog-title">
              <Stack direction="row" alignItems="center" spacing={1}>
                <WarningAmberIcon color="error" fontSize="medium" />
                <Typography variant="h5" component="span" color="error.main" fontWeight="500">
                  {t("warning")}
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t("areYouSureYouWantToDeleteThisItem")}
              </DialogContentText>
            </DialogContent>
            <DialogActions sx={{ pb: 3, px: 3 }}>
              <Button 
                variant="outlined" 
                onClick={() => setDeleteModal(false)}
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                {t("cancel")}
              </Button>
              <Button 
                variant="contained" 
                onClick={handleDeleteAccount} 
                color="error"
                sx={{ borderRadius: '8px', textTransform: 'none' }}
              >
                {t("delete")}
              </Button>
            </DialogActions>
          </Dialog>
          
          {/* Export Confirmation Modal */}
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