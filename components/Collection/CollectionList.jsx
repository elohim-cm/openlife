import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
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
import {useRouter} from "next/navigation";
import toast from "@/utils/toast";
import Toast from "@/utils/toast";
import {useAppContext} from "@/contexts/appContext";
import {Box, Button, FormControl, InputLabel, Select, Stack, TextField, Tooltip} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {AREA_CREATE, COLLECTION_NEW, CREATE_ACCOUNT_PAGE} from "@/utils/routes/routes";
import styles from "@/styles/accountListing.module.scss";
import "@/styles/collection.css";
import {canInterprateError, displayHttpError} from "@/utils/api";
import CollectionService from "@/services/CollectionService";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import ActivityIndicator from "@/components/ActivityIndicator";
import MUIDataTable from "mui-datatables";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import {GiReceiveMoney} from "react-icons/gi";
import {CloudDownload, CopyAllOutlined} from "@mui/icons-material";
import moment from "moment";
import Link from "next/link";
import Routes from "@/utils/routes";
import {GrDocumentPdf} from "react-icons/gr";
import collectionService from "@/services/CollectionService";
import TableUtils from "@/utils/table";
import SubscriptionService from "@/services/SubscriptionService";
import UtilMethods from "@/utils/UtilMethods";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";
import {useTranslation} from "react-i18next";
import ContractService from "@/services/ContractService";
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
import {TbStatusChange} from "react-icons/tb";
import IconButton from "@mui/material/IconButton";
import MDBox from "@/material/components/MDBox";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

const tableUtils = new TableUtils();

const CollectionList = () => {
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
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [collections, setCollections] = useState([]);
  const [systemsPay, setSystemsPay] = useState(undefined);
  const [system, setSystem] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
  const [collectionUuid, setCollectionUuid] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [inProgress, setInProgress] = useState(false);
  const [tableTitle, setTableTitle] = useState(t("allCollections"));
  const [ready, setReady] = useState(false);
  const [activeButtonIndex, setActiveButtonIndex] = useState(1);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const [qCollection, setqCollection] = useState("");
  const param = UtilMethods.getStatusParam();
  const [statut, setStatut] = useState("");

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

    const url = new URL(`${BASE_URL}/collection`);
    const filters = formatTableFilters(columnFilters);
    const sortingTab = formatTableSorting(sorting);
    if (system && system !== "") filters.payment_system = system;
    if (startDate !== "") filters["start_date"] = startDate;
    if (endDate !== "") filters["end_date"] = endDate;
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
        setRecords(response.data.data.collections);
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
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    system,
    param,
    startDate,
    endDate,
  ]);

  useEffect(() => {
    fetchRecord();
  }, [fetchRecord]);

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
        header: t("initDate"),
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

  const getPaymentSys = useCallback(async () => {
    const response = await CollectionService.getPaymentSystems();
    if (response.error === null) {
      setSystemsPay(response.data);
    } else {
      displayHttpError(response.error, router);
    }
  }, [router]);

  useEffect(() => {
    getPaymentSys();
  }, [getPaymentSys]);

  // clone a collection
  const handleCloneCollection = collectionUUID => {
    // request the clone api
    const response = CollectionService.clone(token, collectionUUID);

    if (response.error == null) {
      Toast.success(t("collectionClonedSuccessfully"));
      getCollections(currentPage, qCollection, statut, system);
    } else {
      toast.show(t("anErrorOccurredPleaseRetryLater"), 3000, "error");
    }
  };

  const handleDownloadReceipt = async _uid => {
    if (!inProgress) {
      setInProgress(true);
      const result = await collectionService.download(token, _uid);
      setInProgress(false);
      if (result.error == null) {
        Toast.success(t("receiptOpenedSuccessfully"));
      } else {
        displayHttpError(result.error, router);
      }
    }
  };

  //  table data
  let tableData = (_records = []) => {
    return _records.map(collection => ({
      id: collection.uid,
      id_contract: collection.contract.code,
      payment_system: collection.payment ? collection.payment?.payment_system : "",
      date: collection.payment ? collection.payment.date_init : `${t("undefined")}`,
      amount: collection.amount,
      payment_phone: collection.payment ? collection.payment.phone : `${t("undefined")}`,
      payment_ref: collection.payment ? collection.payment_reference : `${t("undefined")}`,
      payment_date: collection.payment_date,
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

  const today = new Date().toISOString().split("T")[0];

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
        {(UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) && (
          <Stack direction="row" alignItems="center" gap={2}>
            <Stack direction="row" alignItems="center" gap={2}>
              <TextField
                onChange={e => {
                  setStartDate(e.target.value.trim());
                }}
                value={startDate}
                variant="filled"
                type="date"
                label={`${t("startDate")}*`}
                error={startDate === ""}
                sx={{width: "100%"}}
                size="normal"
                style={{minWidth: "150px!important"}}
                inputProps={{max: today}}
              />

              <TextField
                onChange={e => {
                  setEndDate(e.target.value.trim());
                }}
                value={endDate}
                variant="filled"
                type="date"
                label={`${t("endDate")}`}
                sx={{width: "100%"}}
                size="normal"
                style={{minWidth: "150px!important"}}
                inputProps={{max: today}}
              />
            </Stack>

            <Button
              disabled={startDate === ""}
              style={{marginLeft: "12px"}}
              variant="outlined"
              onClick={handleDownloadResources}>
              {t("export")}
            </Button>
          </Stack>
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

  const handleSystemChange = (e, _system) => {
    if (_system !== null) {
      console.log(_system);
      setSystem(_system.uid);
    } else {
      setSystem("");
    }
  };

  const handleDownloadResources = async () => {
    const freshToken = getToken();
    await Export.stream(freshToken, context, router, "collections", "", startDate, endDate);
  };

  return (
    <>
      <Box sx={{mt: 2, mb: 2}}>
        <ActivityIndicator visible={inProgress} />
        <Stack
          direction="row"
          sx={{display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%"}}
          spacing={2}>
          {systemsPay === undefined ? (
            <Skeleton width="50%" height="50px" />
          ) : (
            <Grid container>
              <Grid item xs={12} md={4}>
                <Autocomplete
                  disablePortal
                  id="payment"
                  onInputChange={(event, newValue) => {
                    console.log(newValue);
                  }}
                  onChange={handleSystemChange}
                  options={systemsPay}
                  renderInput={params => <TextField {...params} label={t("filterByPaymentSystem")} variant="filled" />}
                />
              </Grid>
            </Grid>
          )}
        </Stack>
      </Box>
      {!ready ? (
        <TableSkeleton rowsNumber={12} />
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
          await tableUtils.handleDownload(columns, tableData, true, CollectionService.getAll);
          downloadRef.current?.toggleLoader(false);
          downloadRef.current?.close();
        }}
        onCancel={() => {
          tableUtils.handleDownload(columns, tableData);
        }}
      />
      <Box sx={{mb: 3}}></Box>
    </>
  );
};

export default CollectionList;
