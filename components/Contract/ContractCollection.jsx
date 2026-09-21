import React, {useCallback, useEffect, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import {useRouter} from "next/navigation";
import {
  formatNumber,
  formatTableFilters,
  formatTableSorting,
  getLanguage,
  getStatusBadge,
  getToken,
  handleDownloadCsv,
} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import {displayHttpError} from "@/utils/api";
import moment from "moment/moment";
import UtilMethods from "@/utils/UtilMethods";
import {Box, Button, Stack, Tooltip, Typography} from "@mui/material";
import Link from "next/link";
import Routes from "@/utils/routes";
import VisibilityIcon from "@mui/icons-material/Visibility";
import styles from "@/styles/accountListing.module.scss";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable,
} from "material-react-table";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import {BUYBACK_NEW, COLLECTION_NEW} from "@/utils/routes/routes";
import {TbStatusChange} from "react-icons/tb";
import IconButton from "@mui/material/IconButton";
import {columns, tableData} from "@/components/buyback/BuyBackList";
import {CloudDownload, CopyAllOutlined} from "@mui/icons-material";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import ActivityIndicator from "@/components/ActivityIndicator";
import {GrDocumentPdf} from "react-icons/gr";
import {GiReceiveMoney} from "react-icons/gi";
import Export from "@/services/Export";

const ContractCollection = ({focus, contract}) => {
  const {t} = useTranslation();
  const [records, setRecords] = React.useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [ready, setReady] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 15,
  });
  const [inProgress, setInProgress] = useState(false);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };

  const fetchRecord = useCallback(async () => {
    if (!records.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }

    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
    };

    const url = new URL(`${BASE_URL}/collection`);
    const filters = formatTableFilters(columnFilters);
    const sortingTab = formatTableSorting(sorting);
    url.searchParams.set("contract", `${contract?.uid}`);
    url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
    url.searchParams.set("per_page", `${pagination.pageSize}`);
    url.searchParams.set("filters", JSON.stringify(filters));
    url.searchParams.set("q", globalFilter ?? "");
    url.searchParams.set("sorting", JSON.stringify(sortingTab));

    try {
      const response = await axios.get(url.href, config);
      if (response.status === 200) {
        setRecords(response.data.data.collections);
        setRowCount(response.data.data.pagination.total);
      }
      resetScroll();
    } catch (error) {
      setIsError(true);
      console.error(error);
      displayHttpError(error, router);
      return;
    }
    setIsError(false);
    setIsLoading(false);
    setIsRefetching(false);
    setReady(true);
  }, [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting]);

  useEffect(() => {
    if (focus) {
      fetchRecord();
    }
  }, [fetchRecord, focus]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "id_contract", //access nested data with dot notation
        header: t("ctrNumber"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "payment_system",
        header: t("paymentSystem"),
        size: 70,
        enableColumnFilter: false,
      },
      {
        accessorKey: "date",
        header: t("date"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY HH:mm:ss"),
        filterVariant: "datetime",
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "payment_phone",
        header: t("paymentPhone"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "amount",
        header: t("amount"),
        size: 100,
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "payment_ref",
        header: t("paymentRef"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "payment_date",
        header: t("paymentDate"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY HH:mm:ss"),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
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
          {label: t("creationCollections"), value: "creation"},
          {label: t("processingCollections"), value: "processing"},
          {label: t("validatedCollections"), value: "validated"},
          {label: t("rejectedCollections"), value: "rejected"},
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
    [t],
  );

  const handleDownloadResources = async () => await Export.download(token, context, router, "collections");

  //  table data
  let tableData = (_records = []) => {
    return _records.map(collection => ({
      id: collection.uid,
      id_contract: collection.contract.code,
      payment_system: collection.payment ? collection.payment?.payment_system : "",
      date: collection.payment_date,
      amount: collection.amount,
      payment_phone: collection.payment ? collection.payment.phone : `${t("undefined")}`,
      payment_ref: collection.payment ? collection.payment.ref_in : `${t("undefined")}`,
      payment_date: collection.payment ? collection.payment.date_init : `${t("undefined")}`,
      status: collection.status,
      actions: (
        <Stack direction="row" spacing={2}>
          {UtilMethods.getHabilitations(authorizations, "collection").canRead && (
            <Tooltip title={t("showDetails")} placement="bottom">
              <Link href={Routes.COLLECTION_DETAILS(collection.uid)}>
                <VisibilityIcon
                  onClick={() => {
                    context.togglePageLoading(true);
                  }}
                  color="secondary"
                  className={styles.clickableIcon}
                />
              </Link>
            </Tooltip>
          )}
          {UtilMethods.getHabilitations(authorizations, "collection").canClone && (
            <Tooltip title={t("duplicateThisCollection")} placement="bottom">
              <CopyAllOutlined
                onClick={() => {
                  handleCloneCollection(collection.uid);
                }}
                color="secondary"
                className={styles.clickableIcon}
              />
            </Tooltip>
          )}
          <Tooltip title={t("viewReceipt")} placement="bottom">
            <GrDocumentPdf
              onClick={() => handleDownloadReceipt(collection.uid)}
              color="secondary"
              className={styles.clickableIcon}
            />
          </Tooltip>
        </Stack>
      ),
    }));
  };

  const mrTable = useMaterialReactTable({
    columns,
    data: tableData(records),
    enableRowSelection: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    localization: getLanguage() === "fr" ? MRT_Localization_FR : MRT_Localization_EN,
    getRowId: row => row.phoneNumber,
    initialState: {
      showColumnFilters: true,
      density: "compact",
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
        <Typography>{t("contractCollections")}</Typography>
        {UtilMethods.getHabilitations(authorizations, "collection").canCreate && (
          <Button
            elevation={1}
            style={{backgroundColor: "#f50c0cd4 !important"}}
            variant="contained"
            className=" __create-collection"
            startIcon={<GiReceiveMoney />}
            onClick={() => {
              context.togglePageLoading(true);
              router.push(COLLECTION_NEW);
            }}>
            {t("performCollection")}
          </Button>
        )}
        <Button style={{marginLeft: "12px"}} variant="outlined" onClick={handleDownloadResources}>
          {t("exportAll")}
        </Button>
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

  return (
    <Box sx={{mb: 2}}>
      {!ready ? (
        <TableSkeleton rowsNumber={13} />
      ) : (
        <Box>
          <ActivityIndicator visible={inProgress} />
          <MaterialReactTable table={mrTable} />
        </Box>
      )}
    </Box>
  );
};

export default ContractCollection;
