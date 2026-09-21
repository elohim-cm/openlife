import React, {useCallback, useEffect, useState, useMemo, useRef} from "react";
import {
    formatNumberStr,
    formatTableFilters,
    formatTableSorting,
    getLanguage,
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
    Tooltip,
} from "@mui/material";
import Link from "next/link";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
    BUSINESS_GOAL_BULK_CREATE, BUSINESS_GOAL_LIST, BUSINESS_GOAL_READ, BUSINESS_GOAL_UPDATE,
} from "@/utils/routes/routes";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import styles from "@/styles/accountListing.module.scss"
import Toast from "@/utils/toast"
import BusinessGoal from "@/services/BusinessGoal";
import {CloudDownload, Visibility} from "@mui/icons-material";
import UtilMethods from "@/utils/UtilMethods";
import authService from "@/services/AuthService";
import {useTranslation} from "react-i18next";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import {displayHttpError} from "@/utils/api";
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
import DashboardBusinessGoal from "@/components/Dashboard/DashboardBusinessGoal";
import {styled} from "@mui/material/styles";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import NoData from "@/components/NoData";

export const formatDated = (inputDate, lang = 'fr') => {
    if (!inputDate || isNaN(new Date(inputDate).getTime())) {
        return '';
    }

    const dateObject = new Date(inputDate);
    const year = dateObject.getFullYear();
    const month = String(dateObject.getMonth() + 1).padStart(2, '0');
    const day = String(dateObject.getDate()).padStart(2, '0');
    const formattedDate = lang === 'fr' ? `${day}/${month}/${year}` : `${year}/${month}/${day}`;

    return formattedDate;
};


export const formatBussinessLabel = (targetName, nature, value, end_date, description, from_listing = false) => {
    const natureLabel = nature ? String(nature).toLowerCase() : '';
    const formattedNature = natureLabel === 'subscription' ? 'Souscription' : 
                           natureLabel === 'collection' ? 'Encaissement' : 
                           nature || '';
    const unit = natureLabel === 'collection' ? 'FCFA' : '';
    const formattedValue = value ? String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '';
    const valueWithUnit = unit ? `${formattedValue} ${unit}` : formattedValue;
    const unitFormatted = from_listing ? '' : `(${valueWithUnit})`;
    return targetName ? `Objectif ${formattedNature} – ${targetName || ''}${unitFormatted ? ' ' + unitFormatted : ''}` : '';
}


const AntTabs = styled((props) => <Tabs disableRipple {...props} />)(({ theme }) => ({
  borderBottom: '1px solid #e8e8e8',
  padding: '16px',
  '& .MuiTabs-indicator': {
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
  },
}))

let textColor = "white";

const AntTab = styled((props) => <Tab disableRipple {...props} />)(({ theme }) => ({
  textTransform: 'none',
  minWidth: 0,
  [theme.breakpoints.up('sm')]: {
    minWidth: 0,
  },
  fontWeight: theme.typography.fontWeightRegular,
  marginRight: theme.spacing(1),
  padding: theme.spacing(1),
  color: theme.palette.text.primary,
  fontFamily: [
    'Poppins',
    'sans-serif',
    'Arial',
  ].join(','),
  '&:hover': {
    color: theme.palette.text.primary,
    opacity: 1,
  },
  '&.Mui-selected': {
    color: '#fff!important',
    fontWeight: theme.typography.fontWeightMedium,
  },
  '&.Mui-focusVisible': {
    backgroundColor: theme.palette.primary.light,
  },
}));

const BusinessGoalListing = () => {
    const [businessGoals, setBusinessGoals] = useState([]);
    const [deleteModal, setDeleteModal] = useState(false);
    const [businessGoalUuid, setBusinessGoalUuid] = useState(1);
    const [inProgress, setInProgress] = useState(false);
    const router = useRouter();
    const token = getToken();
    const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const {t} = useTranslation();
    const [ready, setReady] = useState(false);
  
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

    const [dashboard, setDashboard] = useState(undefined)

    const [value, setValue] = React.useState(0);

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
    const getBusinessGoals = useCallback(
      async () => {
          if (reqCancelable.current) {
            try {
              reqController.current.abort();
            } catch (e) {}
            reqCancelable.current = false;
            reqController.current = new AbortController();
          }

          if (!businessGoals.length) {
              setIsLoading(true);
          } else {
              setIsRefetching(true);
          }
          const config = {
              headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
            signal: reqController.current.signal,
          };

          const url = new URL(`${BASE_URL}/business-goal`);
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
                  setBusinessGoals(response.data.data.business_goals);
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
      // if(value !== 0) {
        getBusinessGoals();
      // }
    }, [getBusinessGoals, isDeleted, value]);

    let tableData = () => {
        return businessGoals?.map(business_goals => ({
            label: String(formatBussinessLabel(business_goals?.target?.name || business_goals?.target?.code, business_goals?.nature, business_goals?.value, business_goals?.end_date, business_goals?.description, true)),
            value: `${business_goals?.nature === 'collection' ? formatNumberStr(business_goals?.value) : business_goals?.value}`,
            nature: business_goals?.nature,
            target: business_goals?.target?.name || (`${business_goals?.target?.last_name || ''} ${business_goals?.target?.first_name || ''}`),
            parent: String(formatBussinessLabel(business_goals.parent?.target?.name || business_goals.parent?.target?.code, business_goals.parent?.nature, business_goals.parent?.value, business_goals.parent?.end_date, business_goals.parent?.description)),
            period: business_goals?.begin_date && business_goals?.end_date 
                ? `${formatDated(business_goals.begin_date, getLanguage())} → ${formatDated(business_goals.end_date, getLanguage())}` 
                : '',
            // description: business_goals?.description || "",
            actions: (
                <Stack direction="row" spacing={1}>
                    {UtilMethods.getHabilitations(authorizations, 'business goals').canRead && <Tooltip title={t("consultDetails")} placement="bottom">
                        <Link href={BUSINESS_GOAL_READ(business_goals.uid)}>
                            <Visibility
                                color="primary"
                                className={styles.clickableIcon}
                                onClick={e => context.togglePageLoading(true)}
                            />
                        </Link>
                    </Tooltip>}
                    {( BusinessGoal.canTreat().includes(business_goals?.type) && UtilMethods.getHabilitations(authorizations, 'business goals').canUpdate) && <Tooltip title={t("update")} placement="bottom">
                        <Link href={BUSINESS_GOAL_UPDATE(business_goals.uid)}>
                            <EditIcon
                                color="primary"
                                className={styles.clickableIcon}
                                onClick={e => context.togglePageLoading(true)}
                            />
                        </Link>
                    </Tooltip>}
                    {(BusinessGoal.canTreat().includes(business_goals?.type) && UtilMethods.getHabilitations(authorizations, 'business goals').canDelete) && <Tooltip title={t("delete")} placement="bottom">
                        <DeleteIcon
                            onClick={() => {
                                setBusinessGoalUuid(business_goals.uid)
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

    const  handleDeleteBusinessGoal = async ()=> {
        try {
            setDeleteModal(false);
            setInProgress(true);

            // request delete api
            const result = await BusinessGoal.destroy(token, businessGoalUuid);
            // show success message
            Toast.success(result);
            // update the networks state
            setIsDeleted(prev => !prev)
            setBusinessGoals(businessGoals.filter(businessGoal => businessGoal.uid !== businessGoalUuid));

        }catch (e) {
            authService.formatFetchErrorMsgAndLogout(e.message, context, router)
        }finally {
            setInProgress(false);
        }
    }

    const _columns = useMemo(
      () => [
          {
              accessorKey: "label",
              header: t("label"),
              size: 100,
              enableColumnFilter: false,
          },
          {
              accessorKey: "value",
              header: t("value"),
              size: 100,
              muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
                  inputProps: {placeHolder: t("filter")},
              }),
          },
          {
              accessorKey: "nature",
              header: t("nature"),
              size: 150,
              filterVariant: "select",
              filterSelectOptions: [
                  {label: t("subscription"), value: BusinessGoal.SOUSCRIPTION},
                  {label: t("collection"), value: BusinessGoal.COLLECTION},
              ],
          },
          {
              accessorKey: "target",
              header: t("target"),
              size: 150,
              muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
                  inputProps: {placeHolder: t("filter")},
              }),
          },
          {
              accessorKey: "parent",
              header: t("parent"),
              size: 150,
              muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
                  inputProps: {placeHolder: t("filter")},
              }),
          },
          {
              accessorKey: "period",
              header: t("period"),
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
        data: tableData(businessGoals),
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
              {UtilMethods.getHabilitations(authorizations, 'business goals').canFit && <Button
                variant="contained"
                onClick={() => {
                    context.togglePageLoading(true);
                    router.push(BUSINESS_GOAL_BULK_CREATE);
                }}
                className="__flex_item __right __text-transform-none">
                  {t("setNewBusinessObjective")}
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
                        acc.push(businessGoals[item.id]);
                        return acc;
                    }, []);
                    const exportableRows = tab.length > 0 ? tab : businessGoals;
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

    const getDashboard = useCallback(async () => {
      const url = new URL(`${BASE_URL}/dashboard/bussiness-goal`);

      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      };

      try {
        const response = await axios.get(url.href, config);
        if (response.status === 200) {
          setDashboard(response.data.data);
        }
      } catch (error) {
        displayHttpError(error, router);
        return;
      }
    }, [])

  useEffect(() => {
    const queryString  = window.location.search;
    const params = new URLSearchParams(queryString);

    // if (!UtilMethods.isAdmin()) {
      if(params.get("value")){
        setValue(1)
      }
      getDashboard()
    // }else{
    //     setValue(1)
    //     setDashboard(null)
    // }
  }, [getDashboard, value])

    return (
        <>
            {!ready ? (
                <TableSkeleton rowsNumber={10} />
            ) : (
                <>
                  <AntTabs value={value} onChange={(event, val) => {
                    if(val === 0){
                      const url = new URL(window.location);
                      const params = new URLSearchParams(url.search);
                      params.set("value", "");
                      url.search = params.toString();
                      router.push(url.toString());
                    }
                    setValue(val)
                  }} aria-label="ant example">
                    <AntTab label={t("Geometry")} />
                    <AntTab label={t("Listing")} />
                  </AntTabs>
                    <Box sx={{mt: 2, mb: 2}}></Box>
                    {value !== 0?
                      <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
                        <MaterialReactTable table={mrTable}/>
                      </MDBox>
                      :
                      <>
                        {dashboard !== undefined ?
                          <>
                            {
                                dashboard !== null ?
                                    <DashboardBusinessGoal dashboard={dashboard} onRefresh={setDashboard}/>
                                    :
                                    <NoData />
                            }
                          </>
                          :
                          <div>Loading...</div>
                        }
                      </>
                    }
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
                            <Button variant="contained" onClick={handleDeleteBusinessGoal} color="error">
                                {t('delete')}
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </>
    );
};

export default BusinessGoalListing;
