import React, {useCallback, useEffect, useRef, useState, useMemo} from "react";
import {deleteAccess, getAccesses} from "@/services/accessService";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {useRouter} from "next/navigation";
import Toast from "@/utils/toast";
import {
  Box,
  Button,
  Chip,
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
import {
  ACCESS_CREATE_PAGE,
  ACCESS_UPDATE,
} from "@/utils/routes/routes";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import {useAppContext} from "@/contexts/appContext";
import {
  formatTableFilters,
  formatTableSorting,
  getLanguage, getStatusBadge,
  handleDownloadCsv,
} from "@/utils";
import AccessService from "@/services/Access";
import {displayHttpError} from "@/utils/api";
import TableUtils from "@/utils/table";
import {CloudDownload, Visibility} from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import AlertDialog from "@/components/DialogLogin";
import ProviderService from "@/services/ProviderService";
import {useTranslation} from "react-i18next";
import AccountService from "@/services/Account";
import ConfirmModal from "@/components/ConfirmModal";
import UtilMethods from "@/utils/UtilMethods";
import Export from "@/services/Export";
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
import MDBox from "@/material/components/MDBox";

const tableUtils = new TableUtils();
const AccessListing = () => {
  const {t} = useTranslation();
  const [accesses, setAccesses] = useState([]);
  const [access, setAccess] = useState({});
  const [inProgress, setInProgress] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [openDetailModal, setOpenDetailModal] = useState(false);
  const [accessUid, setAccessUid] = useState("")
  const router = useRouter();
  const context = useAppContext();
  const [ready, setReady] = useState(false);

  const downloadRef = useRef();
  const reqController = useRef(new AbortController());
  const reqCancelable = useRef(false);

  const param = UtilMethods.getStatusParam();
  //  token
  const {token, authorizations, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};

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

  // request all providers
  const getAllAccesses = useCallback(
    async () => {
      if (reqCancelable.current) {
        try {
          reqController.current.abort();
        } catch (e) {}
        reqCancelable.current = false;
        reqController.current = new AbortController();
      }

      if (!accesses.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: reqController.current.signal,
      };

      const url = new URL(`${BASE_URL}/access`);
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
          setAccesses(response.data.data.accesses);
          setRowCount(response.data.data.pagination.total);
        }
        resetScroll();
      } catch (error) {
        console.error(error);
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
    getAllAccesses();
  }, [getAllAccesses, isDeleted]);

  //  handle delete access
  const handleDeleteAccess = async () => {
    setInProgress(true);

    //  request delete api
    deleteAccess(token, accessUid)
      .then(async response => {
        //  show success message
        Toast.success(response.data.message);

        setOpenDetailModal(false);
        const oldDatas = JSON.parse(localStorage.getItem("storedValues")),
          oldAccesses = oldDatas?.access;
        if (oldAccesses.find(access => access.uid === accessUid)) {
          const newAccesses = oldAccesses.filter(access => access.uid !== accessUid);
          localStorage.setItem(
            "storedValues",
            JSON.stringify({
              ...oldDatas,
              access: newAccesses,
            }),
          );
        }
        //  fetch accesses again
        const {accesses: _accesses, error} = await getAccesses(token)

        if (error !== null){
          setIsDeleted(prev => !prev)
        }else {
          displayHttpError(error, router);
          throw new Error(error)
        }

      })
      .catch(errorResponse => {
        Toast.show(t("anErrorOccurredWhileDeletingAccess"), 3000, "error");
      });

    //  stop the progress indicator
    setInProgress(false);
  };

  useEffect(() => {
    const accessFound = accesses?.find(_access => _access.uid === accessUid);
    setAccess(accessFound);
  }, [accessUid]);

  const authAccesses = accessUuid => localStorage.getItem("currentAccess") === accessUuid;
  //  table data
  let tableData = accesses => {
    return accesses.map(access => ({
      id: access.uid,
      user_name: `${access?.account?.last_name || ""} ${access?.account?.first_name || ""} `,
      role_name: UtilMethods.roleMatching(t)[access?.role?.code],
      status: access?.status ? access?.status : AccessService.INACTIVE,
      code: access?.code,
      actions: access?.code !== "SYSTEM" && (
        <Stack direction="row" spacing={1}>
          {UtilMethods.getHabilitations(authorizations, "access").canRead && <Tooltip title={t("viewDetails")} placement="bottom">
            <Visibility
              onClick={() => {
                setAccessUid(access.uid);
                setDeleteModal(true);
                setAccess(accesses?.find(_access => _access.uid === accessUid));
              }}
              color="info"
              className={styles.clickableIcon}
            />
          </Tooltip>}
          {(access?.role?.code !== 'APP' && UtilMethods.getHabilitations(authorizations, "access").canUpdate) && <Link href={ACCESS_UPDATE(access.uid)}>
            <EditIcon color="primary" className={styles.clickableIcon} onClick={e => context.togglePageLoading(true)}/>
          </Link>}
          {(!authAccesses(access.uid) &&  UtilMethods.getHabilitations(authorizations, "access").canDelete) && (
            <DeleteIcon
              onClick={() => {
                setAccessUid(access.uid);
                setOpenDetailModal(true);
              }}
              color="error"
              className={styles.clickableIcon}
            />
          )}
        </Stack>
      ),
    }));
  };
  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };

  const _columns = useMemo(
    () => [
      {
        accessorKey: "user_name",
        header: t("account"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
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
        accessorKey: "status",
        header: t("status"),
        size: 150,
        Cell: ({cell}) => getStatusBadge(cell.getValue(), t),
        filterVariant: "select",
        filterSelectOptions: [
          {label: AccountService.equivalent(t).active, value: ProviderService.ACTIVE},
          {label: AccountService.equivalent(t).inactive, value: ProviderService.INACTIVE},
        ],
      },
      {
        accessorKey: "code",
        header: t("code"),
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
    data: tableData(accesses),
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
        {UtilMethods.getHabilitations(authorizations, "access").canCreate && <Button
          variant="contained"
          onClick={() => {
            context.togglePageLoading(true);
            router.push(ACCESS_CREATE_PAGE);
          }}
          className="__flex_item __right __text-transform-none">
          {t("createANewAccess")}
        </Button>}
        {(UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) && <Button
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
              acc.push(accesses[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : accesses;
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

  const handleDownloadResources = async () => await Export.download(token, context, router, 'accesses')

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
          <Dialog
            open={openDetailModal}
            onClose={() => setOpenDetailModal(false)}
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
              <Button variant="outlined" onClick={() => setOpenDetailModal(false)}>
                {t("cancel")}
              </Button>
              <Button variant="contained" onClick={handleDeleteAccess} color="error">
                {t("delete")}
              </Button>
            </DialogActions>
          </Dialog>
          <ConfirmModal
            ref={downloadRef}
            title={t("confirmation")}
            content={t("areYouSureYouWantToExportAllData")}
            onConfirm={async () => {
              downloadRef.current?.toggleLoader(true);
              await tableUtils.handleDownload(columns, tableData, true, AccessService.get);
              downloadRef.current?.toggleLoader(false);
              downloadRef.current?.close();
            }}
            onCancel={() => {
              tableUtils.handleDownload(columns, tableData);
            }}
          />
          {deleteModal && access && (
            <AlertDialog title={t("accessDetail")} datas={access} open={deleteModal} onOpenAlert={setDeleteModal} />
          )}
        </>
      )}
    </>
  );
};

export default AccessListing;
