import React, {useEffect, useState, useCallback, useMemo, useRef} from "react";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {useRouter} from "next/navigation";
import Toast from "@/utils/toast";
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
import Link from "next/link";
import styles from "@/styles/accountListing.module.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {MENU_CREATE_PAGE, MENU_UPDATE_PAGE, ROLE_CREATE} from "@/utils/routes/routes";
import ActivityIndicator from "@/components/ActivityIndicator";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {deleteMenu} from "@/services/memuService";
import {deleteAuthorization, getAllAuthorizations} from "@/services/habilitationService";
import {useAppContext} from "@/contexts/appContext";
import Constants from "@/utils/constants";
import {displayHttpError} from "@/utils/api";
import AuthService from "@/services/AuthService";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import {BASE_URL} from "@/utils/api/api";
import {formatTableFilters, formatTableSorting, getLanguage, handleDownloadCsv} from "@/utils";
import axios from "axios";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton, MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable
} from "material-react-table";
import IconButton from "@mui/material/IconButton";
import {CloudDownload} from "@mui/icons-material";
import MDBox from "@/material/components/MDBox";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

const MenuListing = () => {
  const [menus, setMenus] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [menuUid, setMenuUid] = useState("");
  const router = useRouter();
  const context = useAppContext();

  const {t} = useTranslation();
  const [isError, setIsError] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  //  token
  const {token} = JSON.parse(localStorage.getItem("storedValues") ?? Constants.defaultStoredValue);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [ready, setReady] = useState(false);
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
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
  const getMenus = useCallback(
    async () => {
      if (reqCancelable.current) {
        try {
          reqController.current.abort();
        } catch (e) {}
        reqCancelable.current = false;
        reqController.current = new AbortController();
      }
      if (!menus.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: reqController.current.signal,
      };

      const url = new URL(`${BASE_URL}/menu`);
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
          setMenus(response.data.data.menus);
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
    getMenus();
  }, [getMenus]);
  
  //  handle delete access
  const handleDeleteMenu = async () => {
    setInProgress(true);

    // get all habilitations
    getAllAuthorizations(token)
      .then(response => {
        console.log("all authorizations from delete menu ||| ", response);

        let authorizations = response.data.data.authorizations;

        // filter authorizations which contains the menu uid
        response.data.data.authorizations.map(authorization => {
          if (authorization.menu.uid === menuUid) {
            // delete authorization
            deleteAuthorization(token, authorization.uid);
          }
        });
      })
      .catch(errorResponse => {});

    //  request delete api
    deleteMenu(token, menuUid)
      .then(res => {
        console.log(res);
        //  show success message
        Toast.success(res.data.message);

        setDeleteModal(false);
        setMenus(menus.filter(menu => menu.uid !== menuUid));
      })
      .catch(e => {
        AuthService.formatFetchErrorMsgAndLogout(e.response.data.message, context, router);
        setDeleteModal(false);
      });

    //  stop the progress indicator
    setInProgress(false);
  };

  //  table data
  let tableData = (menus) => {
    return menus.map(menu => ({
      label: menu.menu_label,
      icon: menu.icon,
      group: menu.group,
      order: menu.order,
      actions: (
        <Stack direction="row" spacing={1}>
          <Link href={MENU_UPDATE_PAGE(menu.uid)}>
            <EditIcon
              color="primary"
              onClick={() => context.togglePageLoading(true)}
              className={styles.clickableIcon}
            />
          </Link>
          <DeleteIcon
            onClick={() => {
              console.log("delete menu ||| ", menu.uid);
              setMenuUid(menu.uid);
              setDeleteModal(true);
            }}
            color="error"
            className={styles.clickableIcon}
          />
        </Stack>
      ),
    }));
  };

  const _columns = useMemo(
    () => [
      {
        accessorKey: "label",
        header: t("menu"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "icon",
        header: t("icon"),
        size: 150,
      },
      {
        accessorKey: "group",
        header: t("group"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "order",
        header: t("order"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
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
    data: tableData(menus),
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
        {UtilMethods.getHabilitations(authorizations, 'menu').canCreate && <Button
          variant="contained"
          onClick={() => {
            context.togglePageLoading(true);
            router.push(MENU_CREATE_PAGE);
          }}
          className="__flex_item __right __text-transform-none">
          {t("createANewMenu")}
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
              acc.push(menus[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : menus;
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
        <TableSkeleton rowsNumber={8} />
      ) : (
        <>
          <Box sx={{mt: 2, mb: 2}}></Box>
          <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
            <MaterialReactTable table={mrTable} />
          </MDBox>
          <ActivityIndicator visible={inProgress} />
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
              <Button variant="contained" onClick={handleDeleteMenu} color="error">
                {t("delete")}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default MenuListing;
