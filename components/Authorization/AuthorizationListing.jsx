import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  AUTHORIZATION_CREATE_PAGE,
  AUTHORIZATION_UPDATE_PAGE
} from "@/utils/routes/routes";
import {deleteAuthorization} from "@/services/habilitationService";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {useRouter} from "next/navigation";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import Toast from "@/utils/toast";
import styles from "@/styles/accountListing.module.scss";
import {useAppContext} from "@/contexts/appContext";
import {canInterprateError, displayHttpError} from "@/utils/api";
import HabilitationService from "@/services/Habilitation";
import TableUtils from "@/utils/table";
import AuthService from "@/services/AuthService";
import {useTranslation} from "react-i18next";
import ConfirmModal from "@/components/ConfirmModal";
import {BASE_URL} from "@/utils/api/api";
import {formatTableFilters, formatTableSorting, getLanguage, getStatusBadge, handleDownloadCsv} from "@/utils";
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
import {getAccesses} from "@/services/accessService";
import {getAllPermissions} from "@/services/permissionService";
import {getAllMenu} from "@/services/memuService";

const tableUtils = new TableUtils();

const AuthorizationListing = () => {
  const [authorizations, setAuthorizations] = useState([]);
  const [authorizationUid, setAuthorizationUid] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [ready, setReady] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const context = useAppContext();
  const {t} = useTranslation();
  const downloadRef = useRef(null);

  //  router
  const router = useRouter();

  //  token
  const {token} = JSON.parse(localStorage.getItem("storedValues")) || {};
  
  const [isError, setIsError] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [permissions, setPermissions] = useState([]);
  const [qPermission, setqPermission] = useState("");
  const [menus, setMenus] = useState([]);
  const [qMenu, setqMenu] = useState("");
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
  const getAllAuthorizations = useCallback(
    async () => {
      if (reqCancelable.current) {
        try {
          reqController.current.abort();
        } catch (e) {}
        reqCancelable.current = false;
        reqController.current = new AbortController();
      }
      if (!authorizations.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: reqController.current.signal,
      };

      const url = new URL(`${BASE_URL}/authorization`);
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
          setAuthorizations(response.data.data.authorizations);
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
      getAllAuthorizations();
  }, [getAllAuthorizations, isDeleted]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAllPermissions(token, '', qPermission, 1);
                setPermissions(response.data.permissions);
            } catch (error) {
            }
        };

        fetchData();
    }, [token, qPermission]);
useEffect(() => {
    //  get menus
    getAllMenu(token, "", qMenu, 10, 1).then(response => {
      setMenus(response.data.menus);
    });
  }, [token, qMenu]);
  const _columns = useMemo(
    () => [
      {
        accessorKey: "menu_name",
        header: t("menu"),
        size: 100,
          filterVariant: "select",
          filterSelectOptions: menus.map(data => {
              return {label: data.menu_label, value: data.label}
          }),
          PopperProps: {
              style: { maxHeight: 250 }
          }
      },
      {
        accessorKey: "role_name",
        header: t("role"),
        size: 150,
        filterVariant: "select",
          filterSelectOptions: [
              {label: t("administrator"), value: "ADMIN"},
              {label: t("subscriber"), value: "SOUS"},
              {label: t("provider"), value: "APP"},
              {label: t("inspector"), value: "INP"},
              {label: t("manager"), value: "MNG"},
              {label: t("animator"), value: "ANM"},
              {label: t("commercialDirector"), value: "DCOM"},
              {label: t("customerService"), value: "SCL"},
              {label: t("technicalReferent"), value: "TECH"},
              {label: t("tresorier"), value: "TRE"},
              {label: t("pdg"), value: "PDG"},
          ],
      },
      {
        accessorKey: "permission_name",
        header: t("permission"),
        size: 150,
        filterVariant: "select",
        filterSelectOptions: permissions.map(data => {
              return {label: data.permission_label, value: data.label}
        }),
          PopperProps: {
              style: { maxHeight: 250 }
          }
      },
      {
        accessorKey: "actions",
        header: t("actions"),
        size: 150,
        unexport: true,
        enableColumnFilter: false,
      },
    ],
    [t, permissions, menus],
  );

    //  on delete access
    const handleDeleteAuthorization = async () => {
        try {
            setInProgress(true);

            const result = await deleteAuthorization(token, authorizationUid);
            Toast.success(result);

            setIsDeleted(prev => !prev)

            setAuthorizations(prevAccounts => prevAccounts?.filter(authorization => authorization.uid !== authorizationUid));
            const oldDatas = JSON.parse(localStorage.getItem("storedValues")) || {};

            const relatedRecord = oldDatas.authorizations.filter(authorization => authorization.uid !== authorizationUid);

            localStorage.setItem(
                "storedValues",
                JSON.stringify({
                    ...oldDatas,
                    authorizations: relatedRecord,
                }),
            );

            console.log(relatedRecord);
            // Close delete modal
            handleCloseDeleteModal();
        } catch (error) {
            AuthService.formatFetchErrorMsgAndLogout(error.message, context, router);
            // Close delete modal
            handleCloseDeleteModal();
        }
    };

    const handleCloseDeleteModal = () => {
        setDeleteModal(false);
    };

    //  table data
    let tableData = records => {
        return records.map(authorization => ({
            id: authorization.uid,
            menu_name: authorization.menu.menu_label,
            role_name: authorization.role.role_label,
            permission_name: authorization.permission.permission_label,
            actions: (
                <Stack direction="row" spacing={1}>
                    <Link href={AUTHORIZATION_UPDATE_PAGE(authorization.uid)} onClick={e => context.togglePageLoading(true)}>
                        <EditIcon color="primary" className={styles.clickableIcon} />
                    </Link>
                    <DeleteIcon
                        onClick={() => {
                            setAuthorizationUid(authorization.uid);
                            setDeleteModal(true);
                        }}
                        color="error"
                        className={styles.clickableIcon}
                    />
                </Stack>
            ),
        }));
    };

  const mrTable = useMaterialReactTable({
    columns: _columns,
    data: tableData(authorizations),
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
        <Button
          variant="contained"
          onClick={() => {
            context.togglePageLoading(true);
            router.push(AUTHORIZATION_CREATE_PAGE);
          }}
          className="__flex_item __right __text-transform-none">
          {t("createANewAuthorization")}
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
              acc.push(authorizations[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : authorizations;
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
      {authorizations === undefined ? (
        <TableSkeleton rowsNumber={5} />
      ) : (
        <>
          <Box sx={{mt: 2, mb: 2}}></Box>
          <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
            <MaterialReactTable table={mrTable} />
          </MDBox>
          <Dialog
            open={deleteModal}
            onClose={handleCloseDeleteModal}
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
              <Button variant="outlined" onClick={handleCloseDeleteModal}>
                {t("cancel")}
              </Button>
              <Button variant="contained" onClick={handleDeleteAuthorization} color="error">
                {t("delete")}
              </Button>
            </DialogActions>
          </Dialog>
          <ConfirmModal
            ref={downloadRef}
            title={t("confirmation")}
            content={t("areYouWantingToExportAllData")}
            onConfirm={async () => {
              downloadRef.current?.toggleLoader(true);
              await tableUtils.handleDownload(columns, tableData, true, HabilitationService.get);
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

export default AuthorizationListing;
