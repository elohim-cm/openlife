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
import {useAppContext} from "@/contexts/appContext";
import {Box, Button, Stack, Tooltip} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {BUYBACK_NEW} from "@/utils/routes/routes";
import styles from "@/styles/accountListing.module.scss";
import {displayHttpError} from "@/utils/api";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import ActivityIndicator from "@/components/ActivityIndicator";
import Link from "next/link";
import {TbStatusChange} from "react-icons/tb";
import BuyBackService from "@/services/BuyBackService";
import moment from "moment/moment";
import Routes from "@/utils/routes";
import TableUtils from "@/utils/table";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import ConfirmModal from "@/components/ConfirmModal";
import Export from "@/services/Export";
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable,
} from "material-react-table";
import IconButton from "@mui/material/IconButton";
import {CloudDownload} from "@mui/icons-material";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import MDBox from "@/material/components/MDBox";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import PromptModalgroup from "@/components/PromptModalGroup";
import Toast from "@/utils/toast";
import TwoFAModal from "@/components/TwoFAModal";

const tableUtils = new TableUtils();

export const columns = t => [
  {name: "code", label: t("redemptionCode")},
  {
    name: "amount",
    label: t("amount"),
    options: {
      customBodyRender: _value => formatNumber(_value ?? "0"),
    },
  },
  {name: "subscriber", label: t("subscriber")},
  {
    name: "payment_date",
    label: t("paymentDate"),
    options: {
      customBodyRender: _value => (_value ? moment(_value).format("DD/MM/YYYY HH:mm:ss") : ""),
    },
  },
  {
    name: "status",
    label: t("status"),
    options: {
      customBodyRender: _value => getStatusBadge(_value, t),
    },
  },
  {name: "buyback_type", label: t("buybackType")},
  {name: "payment_system", label: t("paymentSystem")},
  {name: "contract_code", label: t("contractCode")},
  {
    name: "payment_amount",
    label: t("paymentAmount"),
    options: {
      customBodyRender: _value => formatNumber(_value ?? "0"),
    },
  },
  {name: "actions", label: "Actions", options: {filter: true, sort: true}},
];

//  table data
export let tableData =
  (t, authorizations, context) =>
  (_buybacks = []) => {
    return _buybacks?.map(buyback => ({
      id: buyback.uid,
      code: buyback.code,
      amount: buyback.amount,
      subscriber: ` ${buyback.contract.subscription.subscriber.person.last_name} ${buyback.contract.subscription.subscriber.person.first_name}`,
      payment_date: buyback.payment_date,
      status: UtilMethods.getSubscriberStatus(buyback.status),
      buyback_type: buyback.redemption_type,
      payment_system: buyback.payment?.payment_system,
      contract_code: buyback.contract.code,
      payment_amount: buyback.payment?.amount,
      actions: (
        <Stack direction="row" spacing={2}>
          {UtilMethods.getHabilitations(authorizations, "redemption").canRead && (
            <Tooltip title={t("showDetails")} placement="bottom">
              <Link href={Routes.RACHAT_DETAILS(buyback.uid)}>
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
        </Stack>
      ),
    }));
  };

export const statusForRedemption = {
  SCL: "acceptance",
  TECH: "approval",
  PDG: "validation",
  TRE: "payment",
};

export const getVerb = (_util, _t) => {
  if (_util.isCustomerService()) {
    return _t("accept");
  } else if (_util.isTechnicalReferent()) {
    return _t("approve");
  } else if (_util.isPDG()) {
    return _t("validate");
  } else if (_util.isTresearer()) {
    return _t("pay");
  }
};
export const getTitle = (_util, _t) => {
  if (_util.isCustomerService()) {
    return _t("acceptRedemptions");
  } else if (_util.isTechnicalReferent()) {
    return _t("approbationRedemptions");
  } else if (_util.isPDG()) {
    return _t("validationRedemptions");
  } else if (_util.isTresearer()) {
    return _t("paymentRedemptions");
  }
};

export const getContent = (_util, _t) => {
  if (_util.isCustomerService()) {
    return _t("areYouSureAcceptRedemptions");
  } else if (_util.isTechnicalReferent()) {
    return _t("areYouSureApproveRedemptions");
  } else if (_util.isPDG()) {
    return _t("areYouSureValidateRedemptions");
  } else if (_util.isTresearer()) {
    return _t("areYouSurePayRedemptions");
  }
};

const BuyBackList = () => {
  const {t} = useTranslation();
  const [buybacks, setBuybacks] = useState([]);
  const [isError, setIsError] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [inProgress, setInProgress] = useState(false);
  const [ready, setReady] = useState(false);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const param = UtilMethods.getStatusParam();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [inprogress, setInprogress] = useState(false);

  const [selectedRedemptions, setSelectedRedemptions] = useState([]);
  const [opened, setOpened] = useState(false);
  const [reload, setReload] = useState(false);
  const [pendingData, setPendingData] = useState(null);

  const promptRef = useRef(null);
  const paymentRef = useRef(null);
  const confirmDeleteRef = useRef(null);

  const twoFaRef = useRef(null);

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

  const refresh = () => {
    context.togglePageLoading(true);
    window.location.reload();
  };

  const handleRejectGroup = async _value => {
    if (!inprogress) {
      setInprogress(true);
      console.log("REJECT REDEMPTIONS GROUP ||| ", selectedRedemptions);
      let result = await BuyBackService.treatBuybackGroup(
        token,
        {reason: _value, is_accepted: false},
        selectedRedemptions,
      );
      setInprogress(false);
      if (result?.error == null) {
        confirmDeleteRef.current?.close();
        Toast.success(t("requestSuccessfullyRejected"));
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };

  const handleTreatGroup = async (_value, _otp = null) => {
    if (!inprogress) {
      setInprogress(true);
      console.log("TREATMENT REDEMPTIONS GROUP ||| ", selectedRedemptions);
      let result = await BuyBackService.treatBuybackGroup(
        token,
        {reason: _value, is_accepted: true},
        selectedRedemptions,
        _otp
      );
      setInprogress(false);
      twoFaRef.current.toggleLoader(false);

      if(result.error && result.error.response.status === 403 && result.error.response.data.two_step) {
        Toast.warn(result.error.response.data.message);
        setPendingData(_value);
        twoFaRef.current.open(result.error.response.data.data, "notif_action", result.error.response.data.method, result.error.response.data.available_methods);
        return;
      }

      twoFaRef.current.close();
      if (result?.error == null) {
        promptRef.current?.close();

        Toast.success(result.message);
        refresh();
      } else {
        displayHttpError(result?.error, router);
      }
    }
  };

  const getBuybacks = useCallback(async () => {
    if (reqCancelable.current) {
      try {
        reqController.current.abort();
      } catch (e) {}
      reqCancelable.current = false;
      reqController.current = new AbortController();
    }
    if (!buybacks.length) {
      setIsLoading(true);
    } else {
      setIsRefetching(true);
    }
    const config = {
      headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      signal: reqController.current.signal,
    };

    const url = new URL(`${BASE_URL}/redemption`);
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
        setBuybacks(response.data.data.redemptions);
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
    getBuybacks();
  }, [getBuybacks]);

  const statues = (t, _UtilMethods) => {
    if (_UtilMethods.isSubscriber()) {
      return [
        {label: t("inConfirmation"), value: "confirmation"},
        {label: t("inProcessing"), value: "proccessing"},
        {label: t("inPayment"), value: "payment"},
        {label: t("rejected"), value: "rejected"},
        {label: t("validated"), value: "validated"},
      ];
    }
    return [
      {label: t("inConfirmation"), value: "confirmation"},
      {label: t("inAcceptance"), value: "acceptance"},
      {label: t("inApproval"), value: "approval"},
      {label: t("inValidation"), value: "validation"},
      {label: t("inPayment"), value: "payment"},
      {label: t("rejected"), value: "rejected"},
      {label: t("validated"), value: "validated"},
    ];
  };

  const _columns = useMemo(
    () => [
      {
        accessorKey: "code", //access nested data with dot notation
        header: t("redemptionCode"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "amount",
        header: t("amount"),
        size: 150,
        Cell: ({cell}) => formatNumber(cell.getValue(), getLanguage()),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "subscriber_name",
        header: t("subscriber"),
        size: 100,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "phone_subscriber",
        header: t("subscriber_phone"),
        size: 100,
      },
      {
        accessorKey: "beneficiary_phone",
        header: t("beneficiary_phone"),
        size: 100,
        Cell: ({row}) => {
          const phoneSubscriber = row.original.phone_subscriber;
          const beneficiaryPhone = row.original.beneficiary_phone;
          const isDifferent = phoneSubscriber !== beneficiaryPhone;
          return (
              <span style={{fontWeight: isDifferent ? 'bold' : 'normal', color: isDifferent ? '#0d6732' : 'black'}}>
            {beneficiaryPhone}
          </span>
          );
        }
      },
      {
        accessorKey: "status",
        header: t("status"),
        Cell: ({cell}) => getStatusBadge(cell.getValue(), t, false, false),
        size: 70,
        filterVariant: "select",
        filterSelectOptions: statues(t, UtilMethods),
      },
      {
        accessorKey: "created_date",
        header: t("creationDate"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY HH:mm"),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "payment_date",
        header: t("paymentDate"),
        size: 150,
        Cell: ({cell}) => moment(cell.getValue()).format("DD/MM/YYYY HH:mm"),
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
      },
      {
        accessorKey: "buyback_type",
        header: t("buybackType"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
        filterVariant: "select",
        filterSelectOptions: [
          {label: t("partial"), value: "partiel"},
          {label: t("total"), value: "total"},
        ],
      },
      {
        accessorKey: "contract_code",
        header: t("contractCode"),
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

  //  table data
  let _tableData = (_buybacks = []) => {
    return _buybacks.map((buyback, index) => ({
      id: buyback.uid,
      code: buyback.code,
      amount: buyback.amount,
      subscriber_name: ` ${buyback.contract.subscription.subscriber.person.last_name} ${buyback.contract.subscription.subscriber.person.first_name}`,
      phone_subscriber: buyback?.contract?.subscription?.subscriber?.person?.main_phone ?? '',
      beneficiary_phone: buyback.beneficiary_phone ?? '',
      payment_date: buyback.payment_date,
      created_date: buyback.created_at,
      status: UtilMethods.getSubscriberStatus(buyback.status),
      buyback_type: buyback.redemption_type,
      payment_system: buyback.payment?.payment_system,
      contract_code: buyback.contract.code,
      // payment_amount: buyback.payment?.amount,
      actions: (
        <Stack direction="row" spacing={2}>
          {UtilMethods.getHabilitations(authorizations, "redemption").canRead && (
            <Tooltip title={t("showDetails")} placement="bottom">
              <Link href={Routes.RACHAT_DETAILS(buyback.uid)}>
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
        </Stack>
      ),
    }));
  };

  const mrTable = useMaterialReactTable({
    columns: _columns,
    data: _tableData(buybacks),
    enableRowSelection: true,
    enableStickyHeader: true,
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
    muiTableBodyRowProps: ({isDetailPanel, row, table}) => {
      const rowData = buybacks[row.id];
      if (rowData?.status === "validated" || rowData?.status === "rejected") {
        return {};
      }
      const diff = moment().diff(moment(rowData?.confirm_at), "hours");
      if (diff >= 24 && diff < 36) {
        return {
          sx: {bgcolor: "#ff8400"},
        };
      } else if (diff >= 36 && diff < 48) {
        return {
          sx: {bgcolor: "#f13d2d"},
        };
      } else if (diff >= 48) {
        return {
          sx: {bgcolor: "#8c0d02", color: "#fff"},
        };
      } else {
        return {};
      }
    },
    muiTableBodyCellProps: ({cell, column, row, table}) => {
      const rowData = buybacks[row.id];
      if (rowData?.status === "validated" || rowData?.status === "rejected") {
        return {};
      }
      const diff = moment().diff(moment(rowData?.confirm_at), "hours");
      if (diff >= 48) {
        return {
          sx: {color: "#fff"},
        };
      } else {
        return {};
      }
    },
    renderTopToolbarCustomActions: ({table}) => (
      <Box sx={{display: "flex", gap: "1rem", p: "4px"}}>
        {UtilMethods.getHabilitations(authorizations, "redemption").canCreate && (
          <Button
            variant="contained"
            onClick={() => {
              context.togglePageLoading(true);
              router.push(BUYBACK_NEW);
            }}
            color="secondary"
            starticon={<TbStatusChange />}
            className="__flex_item __right __text-transform-none">
            {t("performNewRedemption")}
          </Button>
        )}
        {(UtilMethods.isAdmin() ||
          UtilMethods.isCustomerService() ||
          UtilMethods.isTechnicalReferent() ||
          UtilMethods.getHabilitations(authorizations, "redemption").canExport) && (
          <Button style={{marginLeft: "12px"}} variant="outlined" onClick={handleDownloadResources}>
            {t("exportAll")}
          </Button>
        )}
      </Box>
    ),
    renderToolbarInternalActions: ({table}) => {
      const selectedRowsModel = table.getSelectedRowModel() ?? [];
      let isOk = true;

      if (selectedRowsModel.rows.length > 1) {
        const statues = selectedRowsModel.rows?.map(row => row.original.status);
        isOk = statues.every(status => status === statusForRedemption[UtilMethods.getAuthCodeSecond()]);
      }
      return (
        <Box display="flex" justifyContent="flex-end" alignItems="center">
          {isOk &&
            selectedRowsModel.rows.length > 1 &&
            (UtilMethods.isCustomerService() ||
              UtilMethods.isPDG() ||
              UtilMethods.isTresearer() ||
              UtilMethods.isTechnicalReferent()) && (
              <Stack direction="row" gap={2}>
                <Button
                  variant="contained"
                  onClick={() => {
                    try {
                      const providerValues = selectedRowsModel.rows?.map(row => row.original.id);
                      const statues = selectedRowsModel.rows?.map(row => row.original.status);

                      console.log(providerValues);
                      setSelectedRedemptions(providerValues);
                      let isOk = statues.every(
                        status => status === statusForRedemption[UtilMethods.getAuthCodeSecond()],
                      );
                      if (!isOk) {
                        throw new Error(
                          t("An error has occured, one of the selected commissions does not have a correct status"),
                        );
                      }
                      confirmDeleteRef.current?.open();
                    } catch (e) {
                      Toast.error(e.message);
                    }
                  }}
                  color="error">
                  {t("reject")}
                </Button>
                <Button
                  onClick={() => {
                    try {
                      const providerValues = selectedRowsModel.rows?.map(row => row.original.id);
                      const statues = selectedRowsModel.rows?.map(row => row.original.status);

                      console.log(providerValues);
                      setSelectedRedemptions(providerValues);
                      let isOk = statues.every(
                        status => status === statusForRedemption[UtilMethods.getAuthCodeSecond()],
                      );
                      if (!isOk) {
                        throw new Error(
                          t("An error has occured, one of the selected commissions does not have a correct status"),
                        );
                      }
                      promptRef.current?.open();
                    } catch (e) {
                      Toast.error(e.message);
                    }
                  }}
                  disabled={!isOk}
                  color="primary"
                  variant="contained">
                  {getVerb(UtilMethods, t)}
                </Button>
              </Stack>
            )}
          <MRT_ToggleGlobalFilterButton table={table} />
          <MRT_ToggleFiltersButton table={table} />
          <IconButton
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows ?? [];
              const tab = selectedRows.reduce((acc, item) => {
                acc.push(buybacks[item.id]);
                return acc;
              }, []);
              const exportableRows = tab.length > 0 ? tab : buybacks;
              handleDownloadCsv(_columns, tableData(t, authorizations, context)(exportableRows));
            }}>
            <CloudDownload />
          </IconButton>
          <MRT_ToggleDensePaddingButton table={table} />
          <MRT_ShowHideColumnsButton table={table} />
          <MRT_ToggleFullScreenButton table={table} />
        </Box>
      );
    },
  });

  const handleDownloadResources = async () => await Export.download(token, context, router, "redemptions");

  return (
    <>
      {!ready ? (
        <TableSkeleton rowsNumber={13} />
      ) : (
        <>
          <Box sx={{mt: 2, mb: 2}}>
            <ActivityIndicator visible={inProgress} />
            <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
              <MaterialReactTable table={mrTable} />
            </MDBox>
            <ConfirmModal
              ref={downloadRef}
              title={t("confirmation")}
              content={t("areYouSureYouWantToExportAllData")}
              onConfirm={async () => {
                downloadRef.current?.toggleLoader(true);
                await tableUtils.handleDownload(
                  columns(t),
                  tableData(t, authorizations, context),
                  true,
                  BuyBackService.getAll,
                );
                downloadRef.current?.toggleLoader(false);
                downloadRef.current?.close();
              }}
              onCancel={() => {
                tableUtils.handleDownload(columns(t), tableData(t, authorizations, context));
              }}
            />
          </Box>

          <PromptModalgroup
            ref={confirmDeleteRef}
            title={t("rejectRedemptions")}
            content={t("areYouSureRejectRedemptionSRequest")}
            labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
            required={!UtilMethods.isSubscriber()}
            inProgress={inprogress}
            onConfirm={_value => handleRejectGroup(_value)}
          />
          <PromptModalgroup
            ref={promptRef}
            title={getTitle(UtilMethods, t)}
            content={getContent(UtilMethods, t)}
            labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
            required={!UtilMethods.isSubscriber()}
            inProgress={inprogress}
            onConfirm={_value => handleTreatGroup(_value)}
          />
          <TwoFAModal
            ref={twoFaRef}
            title={t("Two-Factor Authentification")}
            content={t("A Two-Factor OTP has been sent to you by email/sms.")}
            onCancel={() => setInProgress(false)}
            onContinue={otp => handleTreatGroup(pendingData, otp)}/>
        </>
      )}
    </>
  );
};

export default BuyBackList;
