"use client";

import React, {useCallback, useEffect, useState, useMemo, useRef} from "react";
import ProviderService from "@/services/ProviderService";
import {
  formatTableFilters,
  formatTableSorting,
  getLanguage,
  getStatusBadge,
  getToken,
  handleDownloadCsv
} from "@/utils";
import {useRouter} from "next/navigation";
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
  Typography,
  Tooltip, Chip, getChipUtilityClass,
} from "@mui/material";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {BUSINESS_GOAL_READ, PROVIDER_BULK_CREATE, PROVIDER_CREATE, PROVIDER_READ, PROVIDER_UPDATE} from "@/utils/routes/routes";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import styles from "@/styles/accountListing.module.scss";
import {canInterprateError, displayHttpError} from "@/utils/api";
import Toast from "@/utils/toast";
import ActivityIndicator from "@/components/ActivityIndicator";
import {CloudDownload, Visibility, GroupAdd} from "@mui/icons-material";
import AuthService from "@/services/AuthService";
import providerService from "@/services/ProviderService";
import {useTranslation} from "react-i18next";
import AccountService from "@/services/Account";
import UtilMethods from "@/utils/UtilMethods";
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
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

import IconButton from "@mui/material/IconButton";
import MDBox from "@/material/components/MDBox";
import Export from "@/services/Export";

const ProviderListing = () => {
  const {t} = useTranslation();
  const [providers, setProviders] = useState([]);
  const [providerUuid, setProviderUuid] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();
  const [ready, setReady] = useState(false);
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
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
  const getProviders = useCallback(
    async () => {
      if (reqCancelable.current) {
        try {
          reqController.current.abort();
        } catch (e) {}
        reqCancelable.current = false;
        reqController.current = new AbortController();
      }

      if (!providers.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: reqController.current.signal,
      };

      const url = new URL(`${BASE_URL}/provider`);
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
          setProviders(response.data.data.providers);
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
    getProviders();
  }, [getProviders, inDeleting]);
  

  const handleDeleteProvider = async () => {
    setDeleteModal(false);
    try {
      setInProgress(true);

      const result = await ProviderService.deleteProvider(token, providerUuid);
      // success message
      Toast.success(result);
      setInDeleting(prev => !prev)
      // setProviders(providers.filter(provider => provider.uid !== providerUuid));
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
    } finally {
      setInProgress(false);
    }
  };

  //  table data
  let tableData = (providers) => {
    return providers?.map(provider => {
      console.log("Provider::: ", provider);

      const actions = (
          provider?.code !== providerService.SYSTEMCODE && (
              <Stack direction="row" spacing={1}>
                { UtilMethods.getHabilitations(authorizations, 'provider').canRead && <Tooltip title={t("viewDetails")} placement="bottom">
                  <Link href={PROVIDER_READ(provider.uid)}>
                    <Visibility
                        color="primary"
                        className={styles.clickableIcon}
                        onClick={e => context.togglePageLoading(true)}
                    />
                  </Link>
                </Tooltip>}
                {(UtilMethods.getHabilitations(authorizations, 'provider').canUpdate && ProviderService.authProvider(provider)) &&<Tooltip title={t("update")} placement="bottom">
                  <Link href={PROVIDER_UPDATE(provider.uid)}>
                    <EditIcon
                        color="primary"
                        className={styles.clickableIcon}
                        onClick={e => context.togglePageLoading(true)}
                    />
                  </Link>
                </Tooltip>}
                {(UtilMethods.getHabilitations(authorizations, 'provider').canDelete && ProviderService.authProvider(provider)) &&<Tooltip title={t("delete")} placement="bottom">
                  <DeleteIcon
                      onClick={() => {
                        setProviderUuid(provider.uid);
                        setDeleteModal(true);
                      }}
                      color="error"
                      className={styles.clickableIcon}
                  />
                </Tooltip>}
              </Stack>
          )
      );

      return {
        code: provider.code,
        last_name: provider.first_name,
        first_name: provider.last_name,
        status: provider.access ? provider.access.status : ProviderService.INACTIVE,
        professional_email: provider.professional_email,
        provider_nature: provider.provider_nature?.label || "",
        contractual_status: provider.contractual_status || "",
        animation_team: provider.animation_team_name ? provider.animation_team_name : "",
        actions,
      };
    });
  };

  const _columns = useMemo(
    () => [
      {
        accessorKey: "code",
        header: t("code"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "last_name",
        header: t("lastName"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "first_name",
        header: t("firstName"),
        size: 150,
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
          {label: AccountService.equivalent(t)[ProviderService.ACTIVE], value: ProviderService.ACTIVE},
          {label: AccountService.equivalent(t)[ProviderService.INACTIVE], value: ProviderService.INACTIVE},
        ],
      },
      {
        accessorKey: "professional_email",
        header: t("professionalEmail"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "provider_nature",
        header: t("providerNature"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "contractual_status",
        header: t("contractualStatus"),
        size: 150,
        Cell: ({cell}) => ProviderService.contractualStatus(t)[cell.getValue()] || cell.getValue(),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "animation_team",
        header: t("animationTeam"),
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
    data: tableData(providers),
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
        {(UtilMethods.getHabilitations(authorizations, 'provider').canCreate) && <Button
          variant="contained"
          onClick={() => {
            context.togglePageLoading(true);
            router.push(PROVIDER_CREATE);
          }}
          className="__flex_item __right __text-transform-none">
          {t("createNewContributor")}
        </Button>}
          {(UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) &&  <Button
              style={{marginLeft: '12px'}}
              variant="outlined"
              onClick={handleDownloadResources}
              className="__flex_item __right __text-transform-none">
              {t('exportExcel')}
          </Button>}
          {(UtilMethods.isAdmin() || UtilMethods.isPDG() || UtilMethods.isCommercialDirector()) && 
            <Button 
              variant="contained"
              color="secondary"
              style={{marginLeft: '12px'}}
              onClick={() => {
                context.togglePageLoading(true);
                router.push(PROVIDER_BULK_CREATE);
              }}
              className="__flex_item __right __text-transform-none"
            >
              <GroupAdd
                  className={styles.clickableIcon}
              />
              <span style={{marginLeft: '8px'}}>{t('assignProvidersToTeam')}</span>
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
              acc.push(providers[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : providers;
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

    const handleDownloadResources = async () => await Export.download(token, context, router, 'providers')
  return (
    <>
      {!ready ? (
        <TableSkeleton rowsNumber={6} />
      ) : (
        <>
          <Box sx={{mt: 2, mb: 2}}>
            <ActivityIndicator visible={inProgress} />
            <div className="__flex-row"></div>
          </Box>
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
              <Button variant="contained" onClick={handleDeleteProvider} color="error">
                {t("delete")}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default ProviderListing;
