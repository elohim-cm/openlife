import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {
    formatNumber,
    formatTableFilters,
    formatTableSorting,
    getLanguage,
    getStatusBadge,
    getToken, getUid,
    handleDownloadCsv
} from "@/utils";
import {useParams, useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {Box, Button, Stack, TextField, Typography} from "@mui/material";
import {COMMISSION_READ, LOGIN_PAGE, PROVIDER_READ} from "@/utils/routes/routes";
import Toast from "@/utils/toast";
import ActivityIndicator from "@/components/ActivityIndicator";
import Card from "@mui/material/Card";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import moment from "moment";
import ProviderService from "@/services/ProviderService";
import AuthService from "@/services/AuthService";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import {useTranslation} from "react-i18next";
import InfoItem from "@/components/souscription/details/InfoItem";
import Grid from "@mui/material/Grid";
import UtilMethods from "@/utils/UtilMethods";
import MDBox from "@/material/components/MDBox";
import MDButton from "@/material/components/MDButton";
import MDTypography from "@/material/components/MDTypography";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import TableHistoriesCommission from "@/components/Commission/TableHistoriesCommission";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import {displayHttpError} from "@/utils/api";
import Tooltip from "@mui/material/Tooltip";
import {CloudDownload, Visibility} from "@mui/icons-material";
import styles from "@/styles/accountListing.module.scss";
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
import AuthorizationListingSkeleton from "@/components/Authorization/AuthorizationListingSkeleton";
import Export from "@/services/Export";
import {getContent, getTitle, getVerb} from "@/utils/CommissionUtils";
import PromptModal from "@/components/Commission/PromptModal";
import commissionService from "@/services/CommissionService";
import PromptPaymentModal from "@/components/Commission/PromptPaymentModal";

const ProviderRead = () => {
    const {t} = useTranslation();
    const uuid = getUid();
    const [provider, setProvider] = useState(undefined);
    const [records, setRecords] = React.useState([]);
    const [ready, setReady] = React.useState(false);
    const [inProgress, setInProgress] = useState(false);
    const [isVisible, setIsvisible] = useState(false);
    const [inprogress, setInprogress] = React.useState(false);
    const router = useRouter();
    const token = getToken();
    const context = useAppContext();
    const [isShow, setIsShow] = useState(false);
    const storedValues = UtilMethods.getStoredValues();
    const authorizations = storedValues?.authorizations || [];
    const today = new Date().toISOString().split("T")[0];
    const [isError, setIsError] = useState(false);
    const [isIntervalFiltering, setIsIntervalFiltering] = useState(true);
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
    const nature = UtilMethods.getRoleCode()
    const [selectedCommissions, setSelectedCommissions] = useState([])
    const [opened, setOpened] = useState(false);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);


    const promptRef = useRef(null)
    const paymentRef = useRef(null)

    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };
    const getRecords = useCallback(
        async (uuid) => {
            if (!records.length) {
                setIsLoading(true);
            } else {
                setIsRefetching(true);
            }
            const config = {
                headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
            };

            const url = new URL(`${BASE_URL}/commission`);
            const filters = formatTableFilters(columnFilters);
            const sortingTab = formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));
            url.searchParams.set("provider", uuid);

            if(startDate !== ""){
                url.searchParams.set("start_date", startDate);
                url.searchParams.set("end_date", endDate);
            }

            try {
                const response = await axios.get(url.href, config);
                if (response.status === 200) {
                    setRecords(response.data.data.commissions);
                    setRowCount(response.data.data.pagination.total);
                }
                resetScroll();
            } catch (error) {
                setIsError(true);
                console.error(error);
                displayHttpError(error, router);
                return;
            }
            setIsError(false);
            setIsLoading(false);
            setIsRefetching(false);
            setReady(true);
        },
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, uuid, isIntervalFiltering],
    );

    const getProvider = useCallback(
        async (uuid) => {
            try {
                const {data, message} = await ProviderService.show(token, uuid);
                // Toast.success(message)
                setProvider(data)
            }catch (e) {
                AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
            }
        },
        [token, router, uuid, context],
    );

  useEffect(() => {
    context.togglePageLoading(true);
    getProvider(uuid);
    context.togglePageLoading(false);
  }, [getProvider, token, uuid]);

  const handleDisableProvider = async () => {
    if (confirm(t("confirmDisable"))) {
      try {
        setInProgress(true);
        const response = await ProviderService.deactivate(token, uuid);
        Toast.success(response);
      } catch (e) {
        AuthService.formatFetchErrorMsgAndLogout(e.message, context, router);
      } finally {
        setInProgress(false);
      }
    }
  };

    useEffect(() => {
        if(isShow) {
            getRecords(uuid);
        }
    }, [getRecords, isDeleted, isShow, uuid, isIntervalFiltering]);


    let tableData = records => {
        // Calculer les sommes des colonnes
        const totalAmount = records?.reduce((acc, record) => acc + (parseFloat(record?.amount) || 0), 0);
        const totalImposition = records?.reduce((acc, record) => acc + (parseFloat(record?.tax_amount) || 0), 0);
        const totalNetAmount = records?.reduce((acc, record) => acc + (parseFloat(record?.net_amount) || 0), 0);
        const totalCollection = records?.reduce((acc, record) => acc + (parseFloat(record?.collection_amount) || 0), 0);

        const dataWithTotal = [...records];

        // Ajouter la ligne totale uniquement si des enregistrements sont présents
        if (records.length > 0) {
            const totalRow = {
                id: "total",
                code: "", // Vous pouvez laisser vide ou mettre un libellé comme "Total"
                amount: totalAmount,
                tax_amount: totalImposition.toFixed(2),
                net_amount: totalNetAmount,
                collection_amount: totalCollection,
                collection: "",
                status: "",
                actions: "",
                collection_date: "",
            };
            dataWithTotal.push(totalRow);
        }

        return records?.map(record => ({
            id: record.uid,
            code: record.code,
            collection_amount: record.collection_amount,
            amount: record.amount,
            tax_amount: record.tax_amount,
            provider: record.provider?.uid,
            net_amount: record.net_amount,
            collection: record.collection_reference,
            collection_date: record.collection_date,
            status: record.status || '',
            actions: (
                <Stack direction="row" spacing={1}>
                    <Tooltip title={t("viewDetails")} placement="bottom">
                        <Link href={COMMISSION_READ(record?.uid)}>
                            <Visibility
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

    const lg = getLanguage();
    const optionsStatus = (_UtilMethods) => {

        if (_UtilMethods.isTresearer()) {
            return [
                { label: t("inPayment"), value: "payment" },
                { label: t("validated"), value: "validated" }
            ];
        }

        return [
            { label: t("inApproval"), value: "approval" },
            { label: t("inPayment"), value: "payment" },
            { label: t("rejected"), value: "rejected" },
            { label: t("inValidation"), value: "validation" },
            { label: t("validated"), value: "validated" }
        ];
    }
    const optionsNature = (t) => {
        return [
            { label: t("unEmployed"), value: "UNEMPLOYED" },
            { label: t("employed"), value: "EMPLOYEE" },
        ];
    }

    const showProviderColumn = false;
    const _columns = useMemo(
        () => [

            {
                accessorKey: "code",
                header: t("code"),
                size: 100,
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "collection_amount",
                header: t("collectionAmount"),
                size: 150,
                Cell: ({ cell }) => (cell.row.original.id === undefined) ? (
                    <span style={{ backgroundColor: '#F44335', color: 'white', padding: '4px' }}>{formatNumber(cell.getValue(), lg)}</span>
                ) : (
                    formatNumber(cell.getValue(), lg)
                ),
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "amount",
                header: t("amount_but"),
                size: 150,
                Cell: ({ cell }) => (cell.row.original.id === undefined) ? (
                    <span style={{ backgroundColor: '#F44335', color: 'white', padding: '4px' }}>{formatNumber(cell.getValue(), lg)}</span>
                ) : (
                    formatNumber(cell.getValue(), lg)
                ),
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "tax_amount",
                header: t("taxation"),
                size: 150,
                Cell: ({ cell }) => (cell.row.original.id === undefined) ? (
                    <span style={{ backgroundColor: '#F44335', color: 'white', padding: '4px' }}>{formatNumber(cell.getValue(), lg)}</span>
                ) : (
                    formatNumber(cell.getValue(), lg)
                ),
                enableColumnFilter: false,
            },
            {
                accessorKey: "net_amount",
                header: t("netAmount"),
                size: 150,
                Cell: ({ cell }) => (cell.row.original.id === undefined) ? (
                    <span style={{ backgroundColor: '#F44335', color: 'white', padding: '4px' }}>{formatNumber(cell.getValue(), lg)}</span>
                ) : (
                    formatNumber(cell.getValue(), lg)
                ),
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "collection_date",
                header: t("collectionDate"),
                size: 150,
            },
            {
                accessorKey: "collection",
                header: t("collectionReference"),
                size: 150,
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "status",
                header: t("status"),
                size: 150,
                Cell: ({ cell }) => cell.row.original.id === undefined ? null : getStatusBadge(cell.getValue(), t),
                filterVariant: "select",
                filterSelectOptions: optionsStatus(UtilMethods),
            },
            {
                accessorKey: "actions",
                header: t("actions"),
                size: 150,
                unexport: true,
                enableColumnFilter: false,
                Cell: ({ cell }) => (cell.row.original.id === undefined) ? null : cell.getValue(),
            },
        ].filter(Boolean),
        [t, showProviderColumn],
    );

    const mrTable = useMaterialReactTable({
        columns: _columns,
        data: tableData(records),
        enableRowSelection: (row) => {
            return  row.original.id !== undefined;
        },
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
                {(UtilMethods.isTechnicalReferent() || UtilMethods.isProvider()) && (
                    <Stack direction="row" alignItems="center" gap={2}>
                        <Stack direction="row" alignItems="center" gap={2}>
                            <TextField
                                onChange={e => {
                                    setStartDate(e.target.value.trim());
                                }}
                                value={startDate}
                                variant="filled"
                                type="date"
                                label={`${t("startDate")}*`}
                                error={startDate === ""}
                                sx={{width: "100%"}}
                                size="normal"
                                style={{minWidth: "150px!important"}}
                                inputProps={{max: today}}
                            />

                            <TextField
                                onChange={e => {
                                    setEndDate(e.target.value.trim());
                                }}
                                value={endDate}
                                variant="filled"
                                type="date"
                                label={`${t("endDate")}`}
                                sx={{width: "100%"}}
                                size="normal"
                                style={{minWidth: "150px!important"}}
                                inputProps={{max: today}}
                            />
                        </Stack>
                        <Button
                            disabled={startDate === ""}
                            style={{marginLeft: "12px"}}
                            variant="outlined"
                            onClick={() => setIsIntervalFiltering(prev => !prev)}>
                            {t("filterTo")}
                        </Button>
                        <Button
                            disabled={startDate === ""}
                            style={{marginLeft: "4px"}}
                            variant="contained"
                            onClick={() => {
                                setStartDate("")
                                setEndDate(new Date().toISOString().split("T")[0])
                                setIsIntervalFiltering(prev => !prev)
                            }}>
                            {t("resetFilter")}
                        </Button>
                    </Stack>
                )}
            </Box>
        ),
        renderToolbarInternalActions: ({table}) => {
            const selectedRowsModel = table.getSelectedRowModel() ?? [];
            return <Box>

                {(selectedRowsModel.rows.length > 0 && (UtilMethods.isPDG() || UtilMethods.isTresearer() || UtilMethods.isTechnicalReferent())) && (
                    <Button
                        onClick={() => {
                            const providerValues = selectedRowsModel.rows?.map(row => row.original.id);
                            setSelectedCommissions(providerValues);
                            console.log(providerValues)
                            promptRef.current?.open()
                        }}
                        color="primary"
                        variant="contained"
                    >
                        {getVerb(UtilMethods, t)}
                    </Button>
                )}
                    <MRT_ToggleGlobalFilterButton table={table}/>
                    <MRT_ToggleFiltersButton table={table}/>
                    <IconButton
                        onClick={() => {
                            const selectedRows = table.getSelectedRowModel().rows ?? [];
                            const tab = selectedRows.reduce((acc, item) => {
                                acc.push(records[item.id]);
                                return acc;
                            }, []);
                            const exportableRows = tab.length > 0 ? tab : records;
                            handleDownloadCsv(_columns, tableData(exportableRows));
                        }}>
                        <CloudDownload/>
                    </IconButton>
                    <MRT_ToggleDensePaddingButton table={table}/>
                    <MRT_ShowHideColumnsButton table={table}/>
                    <MRT_ToggleFullScreenButton table={table}/>
            </Box>
        },
        muiPaginationProps: {
            rowsPerPageOptions: [10, 20, 50, 100, { label: t("all"), value: rowCount }],
        },
    })

    const action = t => ({
        'TECH': [commissionService.approve, t("requestSuccessfullyApproved")],
        'PDG': [commissionService.validate, t("requestSuccessfullyValidated")],
        'TRE': [commissionService.pay, t("requestSuccessfullyPaid")],
    })

    const handleSendRequest = async (_value) => {
        if (inProgress) return;

        try {
            setInprogress(true);

            let data = null, system = '';
            if (typeof _value === "string") {
                data = {
                    commissions: selectedCommissions,
                    comment: _value,
                    is_accepted: true,
                    provider: [{uid : uuid}],
                    net_amount:0
                };
            } else {
                data = {
                    commissions: selectedCommissions,
                    ..._value,
                    provider: [{uid : uuid}],
                    net_amount:0
                };
                system = _value.system;
            }

            const result = await action(t)[nature][0](token, data, system);

            if (result?.error === null) {
                if (typeof _value !== "string") {
                    setOpened(false);
                }
                promptRef.current?.close();
                Toast.success(action(t)[nature][1]);
                window.location.reload();
            } else {
                displayHttpError(result?.error, router);
            }
        } catch (error) {
            // Gérer les erreurs
            console.error("Erreur lors de l'envoi de la demande :", error);
        } finally {
            setInprogress(false);
        }
    }


    const handleDownloadResources = async () => await Export.download(token, context, router, 'commissions')
    return (
        <>
            {(provider === undefined)?
                <Box sx={{ mt: 2, mb: 2 }}>
                    <Card>
                        <Box sx={{ p: 2 }}>
                            {/*{new Array(6).map((_, i)=> <Skeleton key={i} animation="wave" />)}*/}
                            <Skeleton animation="wave" />
                            <Skeleton animation="wave" />
                            <Skeleton animation="wave" />
                        </Box>
                    </Card>
                </Box>
                : (
                    <Grid sx={{ mt: 2, mb: 2 }}>
                        <ActivityIndicator visible={inProgress} />
                        <Button
                            variant="outlined"
                            startIcon={<ArrowBackIcon />}
                            color="secondary"
                            onClick={e => {
                                context.togglePageLoading(true);
                                router.back();
                            }}
                            sx={{mb: 2}}>
                          {t("back")}
                        </Button>
                        <Card>
                            <MDBox p={3}>
                                <MDBox display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                                    <MDTypography variant="h4" fontWeight="medium">
                                        {t("apporterDetails")}
                                    </MDTypography>
                                    <MDTypography variant="button" color="text" fontWeight="bold">
                                        {t("code")}: {provider.code}
                                    </MDTypography>
                                </MDBox>
                                <Divider />

                                <Grid container spacing={3}>
                                    {/* Section 1: Informations Personnelles & Contact */}
                                    <Grid item xs={12} md={6}>
                                        <MDBox mb={2}>
                                            <MDBox mt={2}>
                                                <InfoItem
                                                    label={t("name")}
                                                    value={`${provider.last_name || ''} ${provider.first_name || ''}`}
                                                    second={{
                                                        label: t("gender"),
                                                        value: UtilMethods.gender(t)[provider.gender?.label] || t("undefined"),
                                                    }}
                                                />
                                                <InfoItem
                                                    label={t("phone")}
                                                    value={provider.phone || t("undefined")}
                                                    second={{
                                                        label: t("personalEmail"),
                                                        value: provider.personal_email || t("undefined"),
                                                    }}
                                                />
                                                <InfoItem
                                                    label={t("address")}
                                                    value={provider.address || t("undefined")}
                                                />
                                            </MDBox>
                                        </MDBox>
                                    </Grid>

                                    {/* Section 2: Informations Professionnelles */}
                                    <Grid item xs={12} md={6}>
                                        <MDBox mb={2}>
                                            <MDBox mt={2}>
                                                <InfoItem
                                                    label={t("status")}
                                                    value={getStatusBadge(provider.access?.status, t)}
                                                    second={{
                                                        label: t("professionalEmail"),
                                                        value: provider.professional_email || t("undefined"),
                                                    }}
                                                />
                                                <InfoItem
                                                    label={t("contributorNature")}
                                                    value={ProviderService.providerNature(t)[provider.provider_nature?.code] || provider.provider_nature?.label || t("undefined")}
                                                    second={{
                                                        label: t("contractualStatus"),
                                                        value: ProviderService.contractualStatus(t)[provider.contractual_status] || provider.contractual_status || t("undefined"),
                                                    }}
                                                />
                                                <InfoItem
                                                    label={t("animationTeam")}
                                                    value={provider.animation_team_name ? (
                                                        <MDTypography variant="button" fontWeight="regular" color="dark">
                                                            {provider.animation_team_name}{" "}
                                                            <Link href={PROVIDER_READ(provider.animation_team_uid)}>
                                                                <MDTypography variant="caption" color="info" sx={{ textDecoration: "underline", cursor: "pointer", ml: 1 }}>
                                                                    {t("seeMore")}
                                                                </MDTypography>
                                                            </Link>
                                                        </MDTypography>
                                                    ) : t("none")}
                                                />
                                                <InfoItem
                                                    label={t("creationDate")}
                                                    value={moment(provider.created_at).format("DD/MM/YYYY HH:mm:ss")}
                                                    second={{
                                                        label: t("updateDate"),
                                                        value: moment(provider.updated_at).format("DD/MM/YYYY HH:mm:ss"),
                                                    }}
                                                />
                                            </MDBox>
                                        </MDBox>
                                    </Grid>
                                </Grid>

                                {(provider.access?.status !== 'inactive' && UtilMethods.getHabilitations(authorizations, 'provider').canDeactivate && ProviderService.authProvider(provider)) && (
                                    <MDBox mt={2} display="flex" justifyContent="flex-end">
                                        <MDButton variant="contained" color="error" onClick={handleDisableProvider}>
                                            {t("disableContributor")}
                                        </MDButton>
                                    </MDBox>
                                )}
                            </MDBox>
                        </Card>
                        {(UtilMethods.isTechnicalReferent() || UtilMethods.isProvider()) && <MDBox mt={2} mb={2}>
                            <MDButton variant="contained" color="primary" onClick={() => setIsShow(prev => !prev)}
                                      sx={{mb: 2}}>
                                {`${isShow ? t("closeCommissionList") : t("openCommissionList")}`}
                            </MDButton>
                        </MDBox>}
                        {isShow && <>
                            {!ready ? (
                                <AuthorizationListingSkeleton/>
                            ) : (
                                <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
                                    <MaterialReactTable table={mrTable}/>
                                </MDBox>
                            )}
                        </>}
                        <PromptModal
                            ref={promptRef}
                            title={getTitle(UtilMethods, t)}
                            content={getContent(UtilMethods, t)}
                            labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
                            required={true}
                            inProgress={inprogress}
                            onSendRequest={_value => handleSendRequest(_value)}
                            role={nature}
                            onHandleOpenPaymentModal={() =>  setOpened(true)}
                        />
                        <PromptPaymentModal
                            refPay={paymentRef}
                            labels={{no: t("no"), yes: t("yes")}}
                            required={true}
                            onSendRequest={_value => handleSendRequest(_value)}
                            opened={opened}
                            onHandleOpening={(val) => setOpened(val)}
                        />
                    </Grid>
                )
            }
        </>
  );
};
export default ProviderRead;
