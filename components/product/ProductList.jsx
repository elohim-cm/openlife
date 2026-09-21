"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
  formatNumber,
  formatTableFilters,
  formatTableSorting,
  getLanguage,
  getStatusBadge,
  getToken,
  handleDownloadCsv,
} from "@/utils";
import {useRouter} from "next/navigation";
import Toast from "@/utils/toast";
import {useAppContext} from "@/contexts/appContext";
import {Box, Button, Stack, Tooltip} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {CONTRACT_UPDATE, PRODUCT_UPDATE} from "@/utils/routes/routes";
import styles from "@/styles/accountListing.module.scss";
import {displayHttpError} from "@/utils/api";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import ActivityIndicator from "@/components/ActivityIndicator";
import ContractService from "@/services/ContractService";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import {TbStatusChange} from "react-icons/tb";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import ProviderService from "@/services/ProviderService";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import selectProviderSchema from "@/components/Contract/schemas/selectProviderSchema";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import IconButton from "@mui/material/IconButton";
import moment from "moment";
import Routes from "@/utils/routes";
import UtilMethods from "@/utils/UtilMethods";
import AuthService from "@/services/AuthService";
import contractService from "@/services/ContractService";
import TableUtils from "@/utils/table";
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
import {CloudDownload} from "@mui/icons-material";
import MDBox from "@/material/components/MDBox";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

const tableUtils = new TableUtils();

const ProductList = () => {
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
  const [currentProduct, setCurrentProduct] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [ready, setReady] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();
  const [openDialog, setOpenDialog] = React.useState(false);
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  const param = UtilMethods.getStatusParam();
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

    const url = new URL(`${BASE_URL}/product`);
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
        setRecords(response.data.data.products);
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
        accessorKey: "label",
        header: t("label"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "max_contract",
        header: t("max_contract"),
        size: 150,
        enableColumnFilter: false,
      },
      {
        accessorKey: "max_collection_monthly",
        header: t("max_collection_monthly"),
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        size: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: "created_at",
        header: t("createdOn"),
        size: 150,
        Cell: ({ cell }) => moment(cell.getValue()).format('YYYY-MM-DD'),
        enableColumnFilter: false,
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


  let tableData = (_products = []) => {
    return _products.map((product) => ({
      id: product.uid,
      label: product.label,
      max_contract: product.max_contract, 
      max_collection_monthly: product.max_collection_monthly,
      created_at: product.created_at,
      actions: (
        <Stack direction="row">
          <Tooltip title={t("update")} placement="bottom">
            <Link href={PRODUCT_UPDATE(product.uid)}>
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
      columnVisibility: {subscriber_phone: false},
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
    <>
      <Box sx={{mb: 1}}></Box>
      {!ready ? (
        <TableSkeleton rowsNumber={13} />
      ) : (
        <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
          <MaterialReactTable table={mrTable} />
        </MDBox>
      )}
    </>
  );
};

export default ProductList;
