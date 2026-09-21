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
import {CONTRACT_UPDATE} from "@/utils/routes/routes";
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

const ContractList = () => {
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
  const [currentContract, setCurrentContract] = useState(null);
  const [selectedContracts, setSelectedContracts] = useState([]);
  const [providers, setProviders] = useState(null);
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

    const url = new URL(`${BASE_URL}/contract`);
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
        setRecords(response.data.data.contracts);
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
        accessorKey: "id_contract", //access nested data with dot notation
        header: t("ctrNumber"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "subscriber_name",
        header: t("subscriber"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "subscriber_phone",
        header: t("subscriberPhone"),
        size: 150,
      },
      {
        accessorKey: "prime",
        header: t("premium"),
        size: 100,
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "collection_sum",
        header: t("totalCollections"),
        size: 150,
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        enableColumnFilter: false,
      },
      {
        accessorKey: "redemption_value",
        header: t("surrenderValue"),
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        size: 150,
        enableColumnFilter: false,
      },
      {
        accessorKey: "unpaid_sum",
        header: t("unpaidAmount"),
        size: 150,
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        enableColumnFilter: false,
      },
      {
        accessorKey: "status",
        header: t("status"),
        Cell: ({cell}) => getStatusBadge(cell.getValue(), t, false, true),
        size: 70,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
        filterVariant: "select",
        filterSelectOptions: [
          {label: t("processing"), value: "processing"},
          {label: t("suspended"), value: "suspended"},
          {label: t("echus"), value: "fence"},
          {label: t("expires"), value: "expired"},
        ],
      },
      {
        accessorKey: "effective_date",
        header: t("effectiveDate"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY"),
        filterVariant: "date",
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "due_date",
        header: t("dueDate"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY"),
        filterVariant: "date",
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

  // request all providers
  const getProviders = useCallback(
    async page => {
      if (UtilMethods.getHabilitations(authorizations, "contract").canReassign) {
        const response = await ProviderService.getAll(token, page);
        console.log("get providers -- contract list ||| ", response);

        // if no errors
        if (response.error === null) {
          setProviders(response.providers);
        } else {
          displayHttpError(response.error, router);
        }
      }
    },
    [token, router],
  );

  useEffect(() => {
    if (UtilMethods.getHabilitations(authorizations, "contract").canReassign) {
      getProviders(1);
    }
  }, [getProviders]);

  // show more options menu
  const showMoreOptionsMenu = e => {
    console.log("Icon clicked via function ||| ", e.currentTarget.parentNode);

    setAnchorEl(e.currentTarget.parentNode);
  };

  // hide more options menu
  const hideMoreOptionsMenu = () => {
    setAnchorEl(null);
  };

  // validation schema
  const {
    formState: {errors, isSubmitting, isValid},
    control,
    handleSubmit,
    getValues,
  } = useForm({
    resolver: zodResolver(selectProviderSchema),
    defaultValues: {provider: null},
    mode: "all",
  });

  // handle suspend contract
  const handleSuspendContract = async uuid => {
    try {
      context.togglePageLoading(true);
      const {message} = await ContractService.suspend(token, uuid);
      Toast.success(message);
    } catch (e) {
      AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
    } finally {
      context.togglePageLoading(false);
    }
  };

  // handle contract activation
  const handleContractActivation = async uuid => {
    const response = await ContractService.reactivate(token, uuid);

    if (response.error === null) {
      Toast.success(t("contractSuccessfullyReactivated"));
    } else {
      Toast.show(t("contractReactivationFailed"), 3000, "error");
    }
  };

  // handle contract activation
  const handleAffectContract = async () => {
    setInProgress(true);
    const affectContract = [];
    const {provider} = getValues();
    let data = {};

    console.log(selectedContracts);
    // match selected rows to contracts
    selectedContracts.forEach(contract => {
      affectContract.push(contract);
    });

    // normalize data
    data = {contracts: affectContract};

    const response = await ContractService.affect(token, provider.uid, data);

    if (response.error === null) {
      if (affectContract.length === 1) {
        setInProgress(false);
        Toast.success(t("contractSuccessfullyAssigned"));
      } else if (affectContract.length > 1) {
        Toast.success(t("allContractsSuccessfullyAssigned"));
      }
    } else {
      Toast.show(t("assignmentFailed"), 3000, "error");
    }
  };

  const handleClickOpen = () => {
    setOpenDialog(true);
  };

  const handleClose = () => {
    setOpenDialog(false);
  };

  const handleDownloadContract = async _uid => {
    if (!inProgress) {
      setInProgress(true);
      const result = await contractService.download(token, _uid);
      setInProgress(false);
      if (result.error == null) {
        Toast.success(t("contractSuccessfullyOpened"));
      } else {
        displayHttpError(result.error, router);
      }
    }
  };

  //  table data
  let tableData = (_contracts = []) => {
    return _contracts.map((contract, index) => ({
      id: contract.uid,
      id_contract: contract.code,
      status: contract.status,
      prime: contract.prime,
      collection_sum: contract.collection_sum,
      redemption_value: contract.redemption_value,
      unpaid_sum: contract.unpaid_sum,
      subscriber_name: contract.subscription.subscriber
        ? `${contract.subscription.subscriber.person.last_name} ${contract.subscription.subscriber.person.first_name}`
        : `${t("undefined")}`,
      subscriber_phone: contract.subscription.subscriber
        ? `${contract.subscription.subscriber.person.main_phone}`
        : `${t("undefined")}`,
      effective_date: contract.effective_date,
      due_date: contract.due_date,
      actions: (
        <Stack direction="row" spacing={2}>
          {UtilMethods.getHabilitations(authorizations, "contract").canRead && (
            <Tooltip title={t("showDetails")} placement="bottom">
              <Link href={Routes.CONTRACT_DETAILS(contract.uid)}>
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
          {(UtilMethods.getHabilitations(authorizations, "contract").canUpdate ||
            UtilMethods.getHabilitations(authorizations, "contract").canAmendment) && (
            <Tooltip title={t("update")} placement="bottom">
              <Link href={CONTRACT_UPDATE(contract.uid)}>
                <EditIcon
                  color="primary"
                  className={styles.clickableIcon}
                  onClick={e => context.togglePageLoading(true)}
                />
              </Link>
            </Tooltip>
          )}
          <Tooltip title={t("moreOptions")} placement="bottom">
            <MoreHorizIcon
              aria-owns={open ? "more-options-popover" : undefined}
              aria-haspopup="true"
              onClick={e => {
                setCurrentContract(contract);
                showMoreOptionsMenu(e);
              }}
              color="secondary"
              className={styles.clickableIcon}
            />
          </Tooltip>
          <Menu
            id="more-options-popover"
            anchorEl={anchorEl}
            open={open}
            onClose={hideMoreOptionsMenu}
            MenuListProps={{
              "aria-labelledby": "basic-button",
            }}>
            {UtilMethods.getHabilitations(authorizations, "contract").canSuspend && (
              <MenuItem
                sx={{color: "secondary"}}
                onClick={() => handleSuspendContract(currentContract ? currentContract.uid : "")}>
                {t("suspendThisContract")}
              </MenuItem>
            )}
            {UtilMethods.getHabilitations(authorizations, "contract").canReactivate && (
              <MenuItem
                sx={{color: "secondary"}}
                onClick={() => handleContractActivation(currentContract ? currentContract.uid : "")}>
                {t("reactivateThisContract")}
              </MenuItem>
            )}
            {UtilMethods.getHabilitations(authorizations, "contract").canDownload && (
              <MenuItem
                sx={{color: "secondary"}}
                onClick={() => handleDownloadContract(currentContract ? currentContract.uid : "")}>
                {t("downloadThisContract")}
              </MenuItem>
            )}
          </Menu>
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
        {selectedContracts.length !== 0 && UtilMethods.getHabilitations(authorizations, "contract").canReassign && (
          <Button
            variant="contained"
            onClick={handleClickOpen}
            color="secondary"
            starticon={<TbStatusChange styles={{color: "#fff"}} />}
            className="secondary-action-button no-text-tranform">
            {t("affect")} {selectedContracts.length < 2 ? t("selectedContract") : t("selectedContracts")}
          </Button>
        )}
        {(UtilMethods.isAdmin() ||
          UtilMethods.isCustomerService() ||
          UtilMethods.isTechnicalReferent() ||
          UtilMethods.getHabilitations(authorizations, "contracts").canExport) && (
          <Button style={{marginLeft: "12px"}} variant="outlined" onClick={handleDownloadResources}>
            {t("exportAll")}
          </Button>
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

  const handleDownloadResources = async () => await Export.download(token, context, router, "contracts");

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
      <Box sx={{mb: 3}}></Box>
      {UtilMethods.getHabilitations(authorizations, "contract").canReassign && (
        <Dialog open={openDialog} onClose={handleClose}>
          <ActivityIndicator visible={inProgress} />
          <DialogTitle>{t("chooseContributor")}</DialogTitle>
          <DialogContent>
            <DialogContentText>
              {t("chooseContributorToAssign")} {selectedContracts.length < 2 ? t("thisContract") : t("theseContracts")}
            </DialogContentText>
            <Controller
              name="provider"
              control={control}
              render={({field: {onChange, value}}) => (
                <Autocomplete
                  id="provider"
                  onChange={(_, item) => {
                    onChange(item);
                  }}
                  value={value}
                  options={providers}
                  getOptionLabel={option => `${option.last_name || ""} ${option.first_name || ""}`}
                  isOptionEqualToValue={(option, value) => option.uid === value.uid}
                  fullWidth
                  disabled={isSubmitting}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={`${t("chooseContributorAgain")}*`}
                      variant="filled"
                      helperText={errors.provider?.message}
                      error={!!errors.provider}
                    />
                  )}
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" color="error" onClick={handleClose}>
              {t("cancel")}
            </Button>
            <Button variant="contained" disabled={!isValid} onClick={handleAffectContract}>
              {t("affect")}
            </Button>
          </DialogActions>
        </Dialog>
      )}
      <ConfirmModal
        ref={downloadRef}
        title={t("confirmation")}
        content={t("areYouSureYouWantToExportAllData")}
        onConfirm={async () => {
          downloadRef.current?.toggleLoader(true);
          await tableUtils.handleDownload(columns, tableData, true, ContractService.getAll);
          downloadRef.current?.toggleLoader(false);
          downloadRef.current?.close();
        }}
        onCancel={() => {
          tableUtils.handleDownload(columns, tableData);
        }}
      />
      <DevTool control={control} placement="top-right" />
    </>
  );
};

export default ContractList;
