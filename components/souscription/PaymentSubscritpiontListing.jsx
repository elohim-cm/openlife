"use client";

import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
import {
  Box,
  Button,
  Stack,
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import Link from "next/link";
import styles from "@/styles/accountListing.module.scss";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {PAYMENT_READ} from "@/utils/routes/routes";
import MUIDataTable from "mui-datatables";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import Tooltip from "@mui/material/Tooltip";
import ActivityIndicator from "@/components/ActivityIndicator";
import {useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {displayHttpError} from "@/utils/api";
import {CloudDownload, Visibility} from "@mui/icons-material";
import PaymentService from "@/services/Payment";
import {
  formatNumber,
  formatTableFilters,
  formatTableSorting,
  getLanguage,
  getStatusBadge,
  handleDownloadCsv
} from "@/utils";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import TableUtils from "@/utils/table";
import ConfirmModal from "@/components/ConfirmModal";
import moment from "moment/moment";
import Export from "@/services/Export";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable
} from "material-react-table";
import IconButton from "@mui/material/IconButton";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import MDBox from "@/material/components/MDBox";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

const tableUtils = new TableUtils();

const PaymentSubscritpiontListing = () => {
  const {t} = useTranslation();
  const theme = useTheme();
  const [payments, setPayments] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const context = useAppContext();
  const {token, authorizations, currentAccess, role_authorizations} =
    JSON.parse(localStorage.getItem("storedValues")) || {};

  const downloadRef = useRef();

  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const reqController = useRef(new AbortController());
  const reqCancelable = useRef(false);

  const param = UtilMethods.getStatusParam();
  // request all providers
  const getPayments = useCallback(
    async () => {
      if (reqCancelable.current) {
        try {
          reqController.current.abort();
        } catch (e) {}
        reqCancelable.current = false;
        reqController.current = new AbortController();
      }
      if (!payments.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: reqController.current.signal,
      };

      const url = new URL(`${BASE_URL}/payment/collection`);
      const filters = formatTableFilters(columnFilters);
      const sortingTab = formatTableSorting(sorting);
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
        reqCancelable.current = true;
        const response = await axios.get(url.href, config);
        if (response.status === 200) {
          setPayments(response.data.data.payment_collection);
          setRowCount(response.data.data.pagination.total);
        }
      } catch (error) {
          if (error.code && error.code === "ERR_CANCELED") {
          return;
          }
        setIsError(true);
        console.error(error);
        displayHttpError(error, router);
        return;
      }
      setIsError(false);
      setIsLoading(false);
      setIsRefetching(false);
      setReady(true);
      reqCancelable.current = false;
      reqController.current = new AbortController();
    },
    [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, param],
  );

  const _columns = useMemo(
    () => [
      {
        accessorKey: "ref_in", //access nested data with dot notation
        header: t("entryReference"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "ref_out",
        header: t("exitReference"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "type",
        header: t("type"),
        size: 70,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
        filterVariant: "select",
        filterSelectOptions: [
          {label: t("subscription"), value: PaymentService.SUBSCRIPTION},
          {label: t("collection"), value: PaymentService.COLLECTION},
        ],
      },
      {
        accessorKey: "amount",
        header: t("amount"),
        size: 150,
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "status",
        header: t("status"),
        size: 150,
        Cell: ({cell}) => getStatusBadge(cell.getValue(), t),
        filterVariant: "select",
        filterSelectOptions: [
          {label: t("initiated"), value: PaymentService.INITIATED},
          {label: t("pending"), value: PaymentService.PENDING},
          {label: t("rejected"), value: PaymentService.REJECTED},
          {label: t("validated"), value: PaymentService.VALIDATED},
        ],
      },
      {
        accessorKey: "date_init",
        header: t("initiationDate"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY HH:mm:ss"),
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

  // Fetch data on mount and when the value changes
  useEffect(() => {
    getPayments();
  }, [getPayments]);

  //  table data
  let tableData = records => {
    return records?.map(payment => {
      return {
        id: payment.uid,
        status: payment.status,
        date_init: payment.date_init,
        ref_in: payment.ref_in,
        ref_out: payment.ref_out,
        type: PaymentService.getType(t)[payment.type],
        amount: payment.amount,
        actions: UtilMethods.getHabilitations(authorizations, "collection payments").canRead && (
          <Tooltip title={t("showDetails")} placement="bottom">
            <Link href={PAYMENT_READ(payment.uid)}>
              <Visibility
                color="primary"
                className={styles.clickableIcon}
                onClick={e => context.togglePageLoading(true)}
              />
            </Link>
          </Tooltip>
        ),
      };
    });
  };


  const mrTable = useMaterialReactTable({
    columns: _columns,
    data: tableData(payments),
    enableRowSelection: true,
    enableStickyHeader: true,
    initialState: {
      showColumnFilters: true,
      density: "compact",
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiTablePaperProps: {className: "__table-expandable"},
    localization: getLanguage() === "fr" ? MRT_Localization_FR : MRT_Localization_EN,
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
    onRowSelectionChange: setRowSelection,
    rowCount,
    state: {
      columnFilters,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
      rowSelection,
    },
    renderTopToolbarCustomActions: ({table}) => (
      <Box sx={{display: "flex", gap: "1rem", p: "4px"}}>
        {((UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) || UtilMethods.getHabilitations(authorizations, 'payments').canExport )&& <Button
          style={{marginLeft: '12px'}}
          variant="outlined"
          onClick={handleDownloadResources}
          className="__flex_item __right __text-transform-none">
          {t('exportExcel')}
        </Button>}
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
              acc.push(payments[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : payments;
            handleDownloadCsv(_columns, tableData(exportableRows));
          }}>
          <CloudDownload />
        </IconButton>
        <MRT_ToggleDensePaddingButton table={table} />
        <MRT_ShowHideColumnsButton table={table} />
        <MRT_ToggleFullScreenButton table={table} />
      </Box>
    ),
  });

  const handleDownloadResources = async () => await Export.download(token, context, router, 'payments', 'collections')

  return (
    <>
      <Box sx={{width: "100%", mt: 1}}>
        <Box sx={{bgcolor: theme.palette.background.default, py: 3}}>
          <Box className="__content-wrapper">
            {!ready? (
              <TableSkeleton rowsNumber={5} />
            ) : (
              <>
                <Box sx={{mt: 2, mb: 2}}>
                  <ActivityIndicator visible={inProgress} />
                  <div className="__flex-row"></div>
                </Box>

                <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
                  <MaterialReactTable table={mrTable} />
                </MDBox>
              </>
            )}
            <ConfirmModal
              ref={downloadRef}
              title={t("confirmation")}
              content={t("areYouSureYouWantToExportAllData")}
              onConfirm={async () => {
                downloadRef.current?.toggleLoader(true);
                await tableUtils.handleDownload(columns, tableData, true, PaymentService.getPaymentCollection);
                downloadRef.current?.toggleLoader(false);
                downloadRef.current?.close();
              }}
              onCancel={() => {
                tableUtils.handleDownload(columns, tableData);
              }}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default PaymentSubscritpiontListing;
