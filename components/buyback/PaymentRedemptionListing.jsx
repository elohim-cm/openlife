"use client";

import React, {useCallback, useEffect, useState, useMemo, useRef} from "react";
import {
    Box,
    Button
} from "@mui/material";
import {useTheme} from "@mui/material/styles";
import Link from "next/link";
import styles from "@/styles/accountListing.module.scss";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {PAYMENT_REDEMPTION_READ,} from "@/utils/routes/routes";
import Tooltip from "@mui/material/Tooltip";
import ActivityIndicator from "@/components/ActivityIndicator";
import {useParams, useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {canInterprateError, displayHttpError} from "@/utils/api";
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
import Export from "@/services/Export";
import moment from "moment/moment";
import {
    MaterialReactTable,
    MRT_ShowHideColumnsButton,
    MRT_ToggleDensePaddingButton,
    MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
    MRT_ToggleGlobalFilterButton,
    useMaterialReactTable
} from "material-react-table";
import IconButton from "@mui/material/IconButton";
import MDBox from "@/material/components/MDBox";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

const PaymentRedemptionListing = () => {
    const {t} = useTranslation();
    const theme = useTheme()
    const [payments, setPayments] = useState([]);
    const [inProgress, setInProgress] = useState(false);
    const [tableTitle, setTableTitle] = useState(t("allPayments"));
    const router = useRouter();
    const [ready, setReady] = useState(false);
    const context = useAppContext();
    const [statut, setStatut] = useState('');
    const {token, authorizations, currentAccess, role_authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const param = UtilMethods.getStatusParam()

    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const reqController = useRef(new AbortController());
    const reqCancelable = useRef(false);

  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };

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

          const url = new URL(`${BASE_URL}/payment/redemption`);
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
                  setPayments(response.data.data.payment_redemption);
                  setRowCount(response.data.data.pagination.total);
              }
              resetScroll();
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

    //Fetch data on mount and when the value changes
    useEffect(() => {
        getPayments();
    }, [getPayments]);

    //  table data
    let tableData = (payments) => {
        return payments?.map(payment => {
            return {
                amount: payment.amount,
                phone: payment.phone,
                status: payment.status,
                date: payment.date,
                date_init: payment.date_init,
                actions: (
                    UtilMethods.getHabilitations(authorizations, 'redemption payments').canRead && (<Tooltip title={t("showDetails")} placement="bottom">
                        <Link href={PAYMENT_REDEMPTION_READ(payment.uid)}>
                            <Visibility
                                color="primary"
                                className={styles.clickableIcon}
                                onClick={e => context.togglePageLoading(true)}
                            />
                        </Link>
                    </Tooltip>)
                ),
            };
        });
    };

    const _columns = useMemo(
      () => [
          {
              accessorKey: "amount", //access nested data with dot notation
              header: t("amount"),
            Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
            size: 100,
              muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
                  inputProps: {placeHolder: t("filter")},
              }),
          },
          {
              accessorKey: "phone",
              header: t("phoneNumber"),
              size: 150,
              muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
                  inputProps: {placeHolder: t("filter")},
              }),
          },
          {
              accessorKey: "status",
              header: t("status"),
              Cell: ({cell}) => getStatusBadge(cell.getValue(), t),
              size: 70,
              filterVariant: "select",
              filterSelectOptions: [
                  {label: t("initiated"), value: "initiated"},
                  {label: t("pending"), value: "pending"},
                  {label: t("rejected"), value: "rejected"},
                  {label: t("validated"), value: "validated"},
              ],
          },
          {
              accessorKey: "date",
              header: t("expiryDate"),
              size: 150,
              Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY HH:mm:ss"),
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
      muiTableContainerProps: {className: "__table-container"},
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
              {((UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) || UtilMethods.getHabilitations(authorizations, 'payments').canExport) && <Button
                style={{marginLeft: '12px'}}
                variant="outlined"
                onClick={handleDownloadResources}
                className="__flex_item __right __text-transform-none">
                {t('exportAll')}
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

    const handleDownloadResources = async () => await Export.download(token, context, router, 'payments', 'redemptions')

    return (
        <>
            <Box sx={{ width: '100%', mt:1}}>
                <Box sx={{ bgcolor:theme.palette.background.default , py:3}}>
                    <Box className="__content-wrapper">
                        {!ready? (
                            <TableSkeleton rowsNumber={5} />
                        ) : (
                            <>
                                <Box sx={{mt: 2, mb: 2}}>
                                    <ActivityIndicator visible={inProgress} />
                                </Box>
                                <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
                                    <MaterialReactTable table={mrTable} />
                                </MDBox>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default PaymentRedemptionListing;
