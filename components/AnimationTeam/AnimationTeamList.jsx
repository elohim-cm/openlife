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
import {TEAM_CREATE, TEAM_UPDATE, PROVIDER_READ} from "@/utils/routes/routes";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import styles from "@/styles/accountListing.module.scss";
import {canInterprateError, displayHttpError} from "@/utils/api";
import AnimationTeamService from "@/services/AnimationTeamService";
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
import {CloudDownload, GroupAdd} from "@mui/icons-material";
import MDBox from "@/material/components/MDBox";

const AnimationTeamList = () => {
  const [teams, setTeams] = useState([]);
  const [ready, setReady] = useState(false);
  const [teamUuid, setTeamUuid] = useState("");
  const [deleteModal, setDeleteModal] = useState(false);
  const [inProgress, setInProgress] = useState(false);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const {t} = useTranslation();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
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
  const getTeams = useCallback(
    async () => {
      if (reqCancelable.current) {
        try {
          reqController.current.abort();
        } catch (e) {}
        reqCancelable.current = false;
        reqController.current = new AbortController();
      }
      
      if (!teams.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
        signal: reqController.current.signal,
      };

      const url = new URL(`${BASE_URL}/animation-team`);
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
          setTeams(response.data.data.animation_teams);
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
    getTeams();
  }, [getTeams, inDeleting]);

  const handleDeleteTeam = async () => {
    // remove the delete modal
    setDeleteModal(false);

    // show progress indicator
    setInProgress(true);

    // request delete api
    const response = await AnimationTeamService.deleteArea(token, teamUuid);

    if (response.status === 200) {
      // show success message
      Toast.success("animationTeamSuccessfullyRemoved");

      setInProgress(false);

      setInDeleting(prev => !prev)
      setTeams(teams.filter(team => team.uid !== teamUuid));

    } else {
      Toast.show("anErrorOccurredWhileDeletingTheAnimationTeam", 3000, "error");

      setInProgress(false);
    }

    setInProgress(false);
  };

  //  table data
  let tableData = (teams) => {
    return teams?.map(team => ({
      code: team.code,
      name: team.name,
      animator: team.animator === null ? "" : `${team.animator?.last_name || ''} ${team.animator?.first_name || ''}`,
      animator_data: team.animator, // Données complètes de l'animateur pour le Cell component
      distribution_area: team.distribution_area === null ? "" : team.distribution_area.name,
      providers_count: team.providers_count || 0,
      description: team?.description || "",
      actions: (
        <Stack direction="row" spacing={1}>
          {(UtilMethods.isAdmin() || UtilMethods.isPDG() || UtilMethods.isCommercialDirector()) && UtilMethods.getHabilitations(authorizations, 'animation team').canUpdate && <Tooltip title={t('assignProviders')} placement="bottom">
            <Link href={`/animation-team/bulk-create?eq_uid=${team.uid}`}>
              <GroupAdd
                  color="info"
                  className={styles.clickableIcon}
                  onClick={e => context.togglePageLoading(true)}
              />
            </Link>
          </Tooltip>}
          {(UtilMethods.isMANAGER()) && UtilMethods.getHabilitations(authorizations, 'animation team').canUpdate &&  <Tooltip title={t('update')} placement="bottom">
            <Link href={TEAM_UPDATE(team.uid)}>
              <EditIcon
                  color="primary"
                  className={styles.clickableIcon}
                  onClick={e => context.togglePageLoading(true)}
              />
            </Link>
          </Tooltip>}
          {UtilMethods.getHabilitations(authorizations, 'animation team').canUpdate &&  <Tooltip title={t('delete')} placement="bottom">
            <DeleteIcon
                onClick={() => {
                  setTeamUuid(team.uid);
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
        header: t("code"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "name",
        header: t("name"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "animator",
        header: t("animator"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
        Cell: ({ row }) => {
          const animator = row.original.animator_data;
          if (animator && animator.uid) {
            return (
              <Link 
                href={PROVIDER_READ(animator.uid)}
                onClick={e => context.togglePageLoading(true)}
                style={{ 
                  textDecoration: 'none', 
                  color: 'inherit',
                  '&:hover': {
                    textDecoration: 'underline',
                    color: 'primary.main'
                  }
                }}
              >
                <Typography 
                  variant="body2" 
                  sx={{ 
                    color: 'primary.main',
                    '&:hover': {
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }
                  }}
                >
                  {`${animator.last_name || ''} ${animator.first_name || ''}`}
                </Typography>
              </Link>
            );
          }
          return (
            <Typography variant="body2" color="text.secondary">
              {row.getValue()}
            </Typography>
          );
        },
      },
      {
        accessorKey: "distribution_area",
        header: t("distributionArea"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "providers_count",
        header: t("providersCount"),
        size: 100,
        enableColumnFilter: false,
        Cell: ({ cell }) => (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {cell.getValue()}
            </Typography>
          </Box>
        ),
      },
      {
        accessorKey: "description",
        header: t("description"),
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
    data: tableData(teams),
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
        {UtilMethods.getHabilitations(authorizations, 'animation team').canCreate && <div className="__flex-row">
          <Button
            variant="contained"
            onClick={() => {
              context.togglePageLoading(true);
              router.push(TEAM_CREATE);
            }}
            className="__flex_item __right __text-transform-none">
            {t('createANewAnimationTeam')}
          </Button>
        </div>}
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
              acc.push(teams[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : teams;
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
          <Box sx={{mt: 2, mb: 2}}></Box>
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
                  {t('warning')}
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                {t('areYouSureYouWantToDeleteThisItem')}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button variant="outlined" onClick={() => setDeleteModal(false)}>
                {t('cancel')}
              </Button>
              <Button variant="contained" onClick={handleDeleteTeam} color="error">
                {t('delete')}
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </>
  );
};

export default AnimationTeamList;
