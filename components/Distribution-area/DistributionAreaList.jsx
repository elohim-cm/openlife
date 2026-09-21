import React, {useCallback, useEffect, useState, useMemo, useRef} from "react";
import {
  formatTableFilters,
  formatTableSorting,
  getLanguage,
  getToken,
  handleDownloadCsv
} from "@/utils";
import {useRouter} from "next/navigation";
import Toast from "@/utils/toast";
import {useAppContext} from "@/contexts/appContext";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {AREA_CREATE, AREA_UPDATE} from "@/utils/routes/routes";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import styles from "@/styles/accountListing.module.scss";
import {displayHttpError} from "@/utils/api";
import DistributionAreaService from "@/services/DistributionAreaService";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable
} from "material-react-table";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import IconButton from "@mui/material/IconButton";
import {CloudDownload} from "@mui/icons-material";
import MDBox from "@/material/components/MDBox";

const DistributionAreaList = () => {
  const {t} = useTranslation();
  const [areas, setAreas] = useState([]);
  const [areaUuid, setAreaUuid] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  const columns = [
    {name: "code", label: t("zoneCode")},
    {name: "name", label: t("zoneName")},
    {name: "manager", label: t("manager")},
    {name: "network", label: t("network")},
    {name: "description", label: t("descriptions")},
    {name: "actions", label: "Actions", filter: false, sort: false},
  ];

/*  // request all providers
  const getAreas = useCallback(
    async (page, q, _perPage) => {
      const {areas, pagination, error} = await DistributionAreaService.getAll(token, page, q, _perPage);
      console.log("get all areas response ||| ", error);

      // if no errors
      if (error === null) {
        setAreas(areas);
        setPagination(pagination);
        setCurrentPage(pagination.current_page);
      } else {
        if (canInterprateError(error, router)) {
          Toast.error(error.response.data.message);
        } else toast.error(t("anErrorHasOccurredPleaseRefreshThePage"), 3000);
      }
    },
    [token, router],
  );

  useEffect(() => {
    getAreas(currentPage, qArea, perPage);
  }, [getAreas, qArea, currentPage, perPage]);*/

  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [ready, setReady] = useState(false);
  const [isError, setIsError] = useState(false);

  const [inDeleting, setInDeleting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});

  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };
  const reqController = useRef(new AbortController());
  const reqCancelable = useRef(false);
  // request all providers
  const getAreas = useCallback(
    async () => {
      if (reqCancelable.current) {
        try {
          reqController.current.abort();
        } catch (e) {}
        reqCancelable.current = false;
        reqController.current = new AbortController();
      }
      
      if (!areas.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: reqController.current.signal,
      };

      const url = new URL(`${BASE_URL}/distribution-area`);
      const filters = formatTableFilters(columnFilters);
      const sortingTab = formatTableSorting(sorting);
      url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
      url.searchParams.set("per_page", `${pagination.pageSize}`);
      url.searchParams.set("filters", JSON.stringify(filters));
      url.searchParams.set("q", globalFilter ?? "");
      url.searchParams.set("sorting", JSON.stringify(sortingTab));

      try {
        reqCancelable.current = true;
        const response = await axios.get(url.href, config);
        if (response.status === 200) {
          setAreas(response.data.data.distribution_areas);
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
    [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
  );

  //Fetch data on mount and when the value changes
  useEffect(() => {
    getAreas();
  }, [getAreas, inDeleting]);

  // delete provider
  const handleDeleteArea = async () => {
    console.log("area uuid ||| ", areaUuid);

    // remove the delete modal
    setDeleteModal(false);

    // show progress indicator
    setInProgress(true);

    // request delete api
    const {status, message, error} = await DistributionAreaService.deleteArea(token, areaUuid);

    if (status === 200) {
      // show success message
      Toast.success(message);

      // stop the progress indicator
      setInProgress(false);

      // update the networks state
      setAreas(areas.filter(area => area.uid !== areaUuid));
      setInDeleting(prev => !prev)

    } else {

      Toast.show(error.response.data.message, 3000, "error");
      setInProgress(false);
    }

    // stop progress indicator
    setInProgress(false);
  };

  //  table data
  let tableData = (areas) => {
    return areas?.map(area => ({
      code: area.code,
      name: area.name,
      network: area.reseau === null ? "" : area.reseau.name,
      manager: area.manager === null ? "" : `${area.manager?.last_name || ''} ${area.manager?.first_name || ''}`,
      description: area?.description || "",
      actions: (
        <Stack direction="row" spacing={1}>
          {(UtilMethods.isINPECTOR()) && UtilMethods.getHabilitations(authorizations, 'distribution area').canUpdate && <Tooltip title={t("update")} placement="bottom">
            <Link href={AREA_UPDATE(area.uid)}>
              <EditIcon
                  color="primary"
                  className={styles.clickableIcon}
                  onClick={e => context.togglePageLoading(true)}
              />
            </Link>
          </Tooltip>}
          {UtilMethods.getHabilitations(authorizations, 'distribution area').canDelete && <Tooltip title={t("delete")} placement="bottom">
            <DeleteIcon
                onClick={() => {
                  setAreaUuid(area.uid);
                  setDeleteModal(true);
                }}
                color="error"
                className={styles.clickableIcon}
            />
          </Tooltip>}
        </Stack>
      ),
    }));
  };

  const _columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: t("zoneCode"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "name",
        header: t("zoneName"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "manager",
        header: t("manager"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "network",
        header: t("network"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "description",
        header: t("descriptions"),
        size: 150,
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

  const mrTable = useMaterialReactTable({
    columns: _columns,
    data: tableData(areas),
    enableRowSelection: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    localization: getLanguage() === "fr" ? MRT_Localization_FR : MRT_Localization_EN,
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
        {(UtilMethods.getHabilitations(authorizations, 'distribution area').canCreate) && <Button
          variant="contained"
          onClick={() => {
            context.togglePageLoading(true);
            router.push(AREA_CREATE);
          }}
          className="__flex_item __right __text-transform-none">
          {t("createNewDistributionZone")}
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
              acc.push(areas[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : areas;
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
  return (
    <>
      {!ready ? (
        <TableSkeleton rowsNumber={10} />
      ) : (
        <>
          <Box sx={{mt: 2, mb: 2}}> </Box>
          <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
            <MaterialReactTable table={mrTable} />
          </MDBox>
          <Dialog
            open={deleteModal}
            onClose={() => setDeleteModal(false)}
            aria-labelledby="alert-delete-access"
            aria-describedby="confirm-delete-access">
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
              <Button variant="contained" onClick={handleDeleteArea} color="error">
                {t("delete")}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default DistributionAreaList;
