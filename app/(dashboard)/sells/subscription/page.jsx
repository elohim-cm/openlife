"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import Routes from "@/utils/routes";
import {Box, Button, Stack, Typography} from "@mui/material";
import AuthorizationListingSkeleton from "@/components/Authorization/AuthorizationListingSkeleton";
import MUIDataTable from "mui-datatables";
import Link from "next/link";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "@/styles/accountListing.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteSubscriptionModal from "@/components/souscription/modals/DeleteSubscriptionModal";
import SubscriptionService from "@/services/SubscriptionService";
import {displayHttpError} from "@/utils/api";
import moment from "moment";
import {
  formatNumber,
  formatTableFilters,
  formatTableSorting,
  getLanguage,
  getStatusBadge,
  getToken,
  handleDownloadCsv,
  toCaptitalize,
} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import TableUtils from "@/utils/table";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import ConfirmModal from "@/components/ConfirmModal";
import Export from "@/services/Export";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable,
} from "material-react-table";
import {CREATE_ACCOUNT_PAGE} from "@/utils/routes/routes";
import IconButton from "@mui/material/IconButton";
import {CloudDownload} from "@mui/icons-material";
import MDBox from "@/material/components/MDBox";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

const tableUtils = new TableUtils();

const SubscriptionPage = () => {
  const {t} = useTranslation();
  const [records, setRecords] = React.useState([]);
  const [isError, setIsError] = useState(false);
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
  const [ready, setReady] = React.useState(false);
  const [currentRecord, setCurrentRecord] = React.useState(null);
  const token = getToken();
  const router = useRouter();
  const deleteRef = React.useRef();
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  const downloadRef = useRef();
  const reqController = useRef(new AbortController());
  const reqCancelable = useRef(false);

  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };

  const param = UtilMethods.getStatusParam();

  const fetchRecord = useCallback(async () => {
    if (reqCancelable.current) {
      try {
        reqController.current.abort();
      } catch (e) {}
      reqCancelable.current = false;
      reqController.current = new AbortController();
    }
    if (!records.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      signal: reqController.current.signal,
    };

    const url = new URL(`${BASE_URL}/subscription`);
    const filters = formatTableFilters(columnFilters);
    const sortingTab = formatTableSorting(sorting);
    url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
    url.searchParams.set("per_page", `${pagination.pageSize}`);
    url.searchParams.set("filters", JSON.stringify(filters));
    url.searchParams.set("q", globalFilter ?? "");
    url.searchParams.set("sorting", JSON.stringify(sortingTab));

    if (Object.keys(filters).length > 0 && !Object.hasOwnProperty("status")) {
      UtilMethods.setStatusParam("");
      url.searchParams.set("status", "");
    }
    if (Object.keys(filters).length <= 0 && param !== null) {
      url.searchParams.set("status", param);
    }
    try {
      reqCancelable.current = true;
      const response = await axios.get(url.href, config);
      if (response.status === 200) {
        setRecords(response.data.data.subscriptions);
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
    reqCancelable.current = false;
    reqController.current = new AbortController();
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, param]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "code", //access nested data with dot notation
        header: t("code"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "prime",
        header: t("premium"),
        size: 100,
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "duration", //normal accessorKey
        header: t("durationYears"),
        size: 70,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "subscriber_name",
        header: t("subscriber"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "subscriber_phone",
        header: t("subscriberPhone"),
        size: 150,
      },
      {
        accessorKey: "provider_name",
        header: t("referrer"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "provider_code",
        header: t("contributorCode"),
        size: 150,
      },
      {
        accessorKey: "provider_phone",
        header: t("providerPhone"),
        size: 150,
      },
      {
        accessorKey: "status",
        header: t("status"),
        Cell: ({cell}) => getStatusBadge(cell.getValue(), t),
        size: 70,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
        filterVariant: "select",
        filterSelectOptions: [
          {label: t("draft"), value: "draft"},
          {label: t("processing"), value: "processing"},
          {label: t("inConfirmation"), value: "confirmation"},
          {label: t("inPayment"), value: "payment"},
          {label: t("rejetees"), value: "rejected"},
          {label: t("validees"), value: "validated"},
        ],
      },
      {
        accessorKey: "subscription_date",
        header: t("subscriptionDate"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY HH:mm:ss"),
        filterVariant: "datetime",
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "effective_date",
        header: t("effectiveDate"),
        size: 150,
      },
      {
        accessorKey: "actions",
        header: t("actions"),
        size: 150,
        unexport: true,
        enableColumnFilter: false,
      },
    ],
    [t],
  );

  let tableData = _datas => {
    return _datas?.map(record => ({
      id: record.uid,
      code: record.code,
      prime: record.prime,
      duration: record.duration,
      provider_name: (record.provider?.last_name || "") + " " + (record.provider?.first_name || ""),
      subscriber_name:
        (record.subscriber?.person?.last_name || "") + " " + (record.subscriber?.person?.first_name || ""),
      subscriber_phone: record.subscriber?.person?.main_phone,
      provider_code: record.provider?.code ?? "",
      provider_phone: record.provider?.phone ?? "",
      status: record.status,
      subscription_date: record.created_at,
      effective_date: record.effective_date,
      actions: (
        <Stack direction="row" spacing={1}>
          {UtilMethods.getHabilitations(authorizations, "subscription").canRead && (
            <Link href={Routes.SOUSCRIPTION_DETAILS(record.uid)}>
              <VisibilityIcon
                color="secondary"
                onClick={() => {
                  context.togglePageLoading(true);
                }}
                className={styles.clickableIcon}
              />
            </Link>
          )}
          {UtilMethods.getHabilitations(authorizations, "subscription").canDelete && (
            <DeleteIcon
              onClick={() => {
                setCurrentRecord(record.uid);
                deleteRef.current.open();
              }}
              color="error"
              className={styles.clickableIcon}
            />
          )}
        </Stack>
      ),
    }));
  };

  const mrTable = useMaterialReactTable({
    columns,
    data: tableData(records),
    enableRowSelection: true,
    onColumnFiltersChange: setColumnFilters,
    enableStickyHeader: true,
    enableStickyFooter: true,
    localization: getLanguage() === "fr" ? MRT_Localization_FR : MRT_Localization_EN,
    getRowId: row => row.phoneNumber,
    initialState: {
      showColumnFilters: true,
      density: "compact",
      columnVisibility: {subscriber_phone: false, provider_code: false, provider_phone: false, effective_date: false},
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiTablePaperProps: {className: "__table-expandable"},
    muiTableContainerProps: {className: "__table-container"},
    muiToolbarAlertBannerProps: isError
      ? {
          color: "error",
          children: t("errorLoadingData"),
        }
      : undefined,
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
    renderTopToolbarCustomActions: ({table}) => (
      <Box sx={{display: "flex", gap: "1rem", p: "4px"}}>
        {UtilMethods.getHabilitations(authorizations, "subscription").canCreate && (
          <Button
            variant="contained"
            onClick={() => {
              context.togglePageLoading(true);
              router.push(Routes.SIMULER);
            }}>
            {t("createASubscription")}
          </Button>
        )}
        {(UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) && (
            <Button style={{marginLeft: "12px"}} variant="outlined" onClick={handleDownloadResources}>
              {t("exportAll")}
            </Button>
          )}
      </Box>
    ),
    renderToolbarInternalActions: ({table}) => (
      <Box>
        <MRT_ToggleGlobalFilterButton table={table} />
        <MRT_ToggleFiltersButton table={table} />
        <IconButton
          onClick={() => {
            const selectedRows = table.getSelectedRowModel().rows ?? [];
            const tab = selectedRows.reduce((acc, item) => {
              acc.push(records[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : records;
            handleDownloadCsv(columns, tableData(exportableRows));
          }}>
          <CloudDownload />
        </IconButton>
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Box>
    ),
  });

  useEffect(() => {
    context.togglePageLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => {
    fetchRecord();
  };

  const handleDownloadResources = async () => await Export.download(token, context, router, "subscriptions");

  return (
    <>
      <Box sx={{mb: 1}}></Box>
      {!ready ? (
        <AuthorizationListingSkeleton />
      ) : (
        <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
          <MaterialReactTable table={mrTable} />
        </MDBox>
      )}
      <ConfirmModal
        ref={downloadRef}
        title={t("confirmation")}
        content={t("areYouSureYouWantToExportAllData")}
        onConfirm={async () => {
          downloadRef.current?.toggleLoader(true);
          await tableUtils.handleDownload(columns, tableData, true, SubscriptionService.get);
          downloadRef.current?.toggleLoader(false);
          downloadRef.current?.close();
        }}
        onCancel={() => {
          tableUtils.handleDownload(columns, tableData);
        }}
      />
      <DeleteSubscriptionModal ref={deleteRef} token={token} record={currentRecord} onDelete={refresh} />
    </>
  );
};

export default SubscriptionPage;
