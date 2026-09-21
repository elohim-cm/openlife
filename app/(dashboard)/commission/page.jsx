"use client";

import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useAppContext} from "@/contexts/appContext";
import TableUtils from "@/utils/table";
import {
    formatNumber,
    formatTableFilters,
    formatTableSorting,
    getLanguage,
    getStatusBadge,
    getToken, getUid,
    handleDownloadCsv
} from "@/utils";
import {useRouter} from "next/navigation";
import {displayHttpError} from "@/utils/api";
import {Box, Button, Stack, TextField} from "@mui/material";
import AuthorizationListingSkeleton from "@/components/Authorization/AuthorizationListingSkeleton";
import CommissionService from "@/services/CommissionService";
import commissionService from "@/services/CommissionService";
import {useTranslation} from "react-i18next";
import Tooltip from "@mui/material/Tooltip";
import {CloudDownload, Visibility} from "@mui/icons-material";
import styles from "@/styles/accountListing.module.scss";
import Link from "next/link";
import {COMMISSION_READ, PROVIDER_READ} from "@/utils/routes/routes";
import UtilMethods from "@/utils/UtilMethods";
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
    useMaterialReactTable
} from "material-react-table";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import IconButton from "@mui/material/IconButton";
import MDBox from "@/material/components/MDBox";
import {getContent, getTitle, getVerb} from "@/utils/CommissionUtils";
import {statusForCommissions} from "@/app/(dashboard)/commission/detail/page";
import PromptModal from "@/components/Commission/PromptModal";
import PromptPaymentModal from "@/components/Commission/PromptPaymentModal";
import Toast from "@/utils/toast";
import CollectionService from "@/services/CollectionService";
import MDAlert from "@/material/components/MDAlert";

const tableUtils = new TableUtils();

const CommissionPage = () => {
    const {t} = useTranslation();
    const [records, setRecords] = React.useState([]);
    const [ready, setReady] = React.useState(false);
    const [massPayment, setMassPayment] = React.useState(false);
    const token = getToken();
    const router = useRouter();
    const context = useAppContext();
    const rolesForValidation = ['PDG',  'TRE']
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

    const downloadRef = useRef();

    useEffect(() => {
        context.togglePageLoading(false);
    }, []);


    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingTwo, setIsLoadingTwo] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0]);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [totalAmount, setTotalAmount] = useState(0);

    const [errors, setErrors] =  useState(null);

    const today = new Date().toISOString().split("T")[0];

    const [inprogress, setInprogress] = React.useState(false);

    const param = UtilMethods.getStatusParam();
    const resetScroll = () => {
        window.scrollTo(0, 0);
        const scrollableTableContainer = document.querySelector(".__table-container");
        if (scrollableTableContainer) {
            scrollableTableContainer.scrollTo(0, 0);
        }
    };

    const nature = UtilMethods.getRoleCode()
    const [selectedCommissions, setSelectedCommissions] = useState([])
    const [selectedProviders, setSelectedProviders] = useState([])
    const [opened, setOpened] = useState(false);
    const [isRegularization, setIsRegularization] = useState(false);
    const promptRef = useRef(null)
    const regularizeRef = useRef(null)
    const regularizepromptRef = useRef(null)
    const paymentRef = useRef(null)
    const [inProgress, setInProgress] = useState(false);
    const reqController = useRef(new AbortController());
    const reqCancelable = useRef(false);
    const [isIntervalFiltering, setIsIntervalFiltering] = useState(true);


    // request all providers
    const getRecords = useCallback(
        async () => {
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

            const hostName = `${BASE_URL}/groups`

            const url = new URL(hostName);
            const filters = formatTableFilters(columnFilters);
            const sortingTab = formatTableSorting(sorting);
            url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
            url.searchParams.set("per_page", `${pagination.pageSize}`);
            url.searchParams.set("filters", JSON.stringify(filters));
            url.searchParams.set("q", globalFilter ?? "");
            url.searchParams.set("sorting", JSON.stringify(sortingTab));

            if(startDate !== ""){
                url.searchParams.set("start_date", startDate);
                url.searchParams.set("end_date", endDate);
            }

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
                    setRecords(response.data.data.commissions);
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
        [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, param, isIntervalFiltering],
    );


    //Fetch data on mount and when the value changes
    useEffect(() => {
        getRecords();
    }, [getRecords, isDeleted, isIntervalFiltering]);

    let tableData = records => {

        const dataWithTotal = [...records];

        return dataWithTotal.map(record => ({
            code: record.code,
            amount: record.amount,
            tax_amount: record.tax_amount,
            provider: `${record.provider?.last_name || ''} ${record.provider?.first_name || ''}`,
            net_amount: record.net_amount,
            collection_amount: record?.collection_amount,
            status: record.status || '',
            nature: record.provider?.provider_nature?.label || '',
            app_uid: record.provider?.uid || '',
            actions: (
                <Stack direction="row" spacing={1}>
                    {UtilMethods.isTechnicalReferent() && <Tooltip title={t("viewDetails")} placement="bottom">
                        <Link href={PROVIDER_READ(record.provider?.uid)}>
                            <Visibility
                                color="primary"
                                className={styles.clickableIcon}
                                onClick={e => context.togglePageLoading(true)}
                            />
                        </Link>
                    </Tooltip>}
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

    const _columns = useMemo(() => {
        let columns = [
            {
                accessorKey: "code",
                header: t("code"),
                size: 100,
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "provider",
                header: t("provider"),
                size: 150,
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "collection_amount",
                header: t("collectionAmount"),
                size: 150,
                Cell: ({ cell }) => formatNumber(cell.getValue(), lg),
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "amount",
                header: t("amount_but"),
                size: 150,
                Cell: ({ cell }) => formatNumber(cell.getValue(), lg),
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "tax_amount",
                header: t("taxation"),
                size: 150,
                Cell: ({ cell }) => formatNumber(cell.getValue(), lg),
                enableColumnFilter: false,
            },
            {
                accessorKey: "net_amount",
                header: t("commission"),
                size: 150,
                Cell: ({ cell }) => <span style={{ background: 'linear-gradient(195deg, #0d6732, #0d6732)', color: 'white', padding: '4px' }}>{formatNumber(cell.getValue(), lg)}</span>,
                muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
                    inputProps: { placeholder: t("filter") },
                }),
            },
            {
                accessorKey: "status",
                header: t("status"),
                size: 150,
                Cell: ({ cell }) => getStatusBadge(cell.getValue(), t),
                filterVariant: "select",
                filterSelectOptions: optionsStatus(UtilMethods),
            },
        ];

        if(UtilMethods.isTechnicalReferent()){
            columns.push({
                accessorKey: "actions",
                header: t("actions"),
                size: 150,
                unexport: true,
                enableColumnFilter: false,
            })
        }
        return columns;
    }, [t, UtilMethods, rolesForValidation]);


    const mrTable = useMaterialReactTable({
        columns: _columns,
        data: tableData(records),
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
        enableStickyFooter: true,
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
                {UtilMethods.getHabilitations(authorizations, 'commission').canExport && <Button
                    style={{marginLeft: '12px'}}
                    variant="outlined"
                    onClick={handleDownloadResources}
                    className="__flex_item __right __text-transform-none">
                    {t('exportExcel')}
                </Button>}
                {
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
                }
            </Box>
        ),
        renderToolbarInternalActions: ({table}) => {
            const selectedRowsModel = table.getSelectedRowModel() ?? [];
            let isOk = true
            if(selectedRowsModel.rows.length >= 1){
                const statues = selectedRowsModel.rows?.map(row => row.original.status);
                isOk =  statues.every(status => status === statusForCommissions[UtilMethods.getAuthCodeSecond()])
            }

            return <Box>
                {(isOk && selectedRowsModel.rows.length >= 1) && (
                    <>
                        <Button
                            onClick={() => {
                                try {
                                    let providerValues = [];

                                    providerValues = selectedRowsModel.rows?.map(row => ({
                                        uid: row.original.app_uid,
                                        amount: row.original.net_amount
                                    }));
                                    setSelectedProviders(providerValues)
                                    setSelectedCommissions([]);

                                    const statues = selectedRowsModel.rows?.map(row => row.original.status);

                                    let isOk =  statues.every(status => status === statusForCommissions[UtilMethods.getAuthCodeSecond()])
                                    if(!isOk && !rolesForValidation.includes(UtilMethods.getRoleCode())){
                                        throw new Error(t('An error has occured, one of the selected commissions does not have a correct status'))
                                    }

                                    setMassPayment(providerValues.length >= 1)
                                    setIsRegularization(false)
                                    setTotalAmount(() => {
                                        return providerValues.reduce((acc, item) => acc + item.amount, 0)
                                    })
                                    promptRef.current?.open()
                                }catch (e) {
                                    Toast.error(e.message);
                                }
                            }}
                            disabled={!isOk}
                            color="primary"
                            variant="contained"
                        >
                            {getVerb(UtilMethods, t)}
                        </Button>
                        {UtilMethods.isTresearer() && <Button
                            color="warning"
                            variant="contained"
                            onClick={() => {
                                try {
                                    let providerValues = [];

                                    providerValues = selectedRowsModel.rows?.map(row => ({
                                        uid: row.original.app_uid,
                                        amount: row.original.net_amount
                                    }));
                                    setSelectedProviders(providerValues)
                                    setSelectedCommissions([]);

                                    const statues = selectedRowsModel.rows?.map(row => row.original.status);

                                    let isOk =  statues.every(status => status === statusForCommissions[UtilMethods.getAuthCodeSecond()])
                                    if(!isOk && !rolesForValidation.includes(UtilMethods.getRoleCode())){
                                        throw new Error(t('An error has occured, one of the selected commissions does not have a correct status'))
                                    }

                                    setIsRegularization(true)
                                    setMassPayment(providerValues.length > 1)
                                    setTotalAmount(() => {
                                        return providerValues.reduce((acc, item) => acc + item.amount, 0)
                                    })
                                    regularizepromptRef.current?.open()
                                }catch (e) {
                                    Toast.error(e.message);
                                }
                            }}
                            style={{marginLeft: '12px'}}
                        >
                            {t("regularize")}
                        </Button>
                        }
                    </>
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
    });

    const handleDownloadResources = async () => {
        const filters = formatTableFilters(columnFilters);

        await Export.download(
            token,
            context,
            router,
            'commissions',
            '',
            startDate,
            endDate,
            {
                filters: JSON.stringify(filters),
                q: globalFilter ?? ""
            }
        )
    }

    const action = t => ({
        'TECH': [commissionService.approve, t("requestSuccessfullyApproved")],
        'PDG': [commissionService.validate, t("requestSuccessfullyValidated")],
        'TRE': [commissionService.pay, t("requestSuccessfullyPaid")],
    })

    const handleSendRequest = async (_value) => {
        if (inProgress) return;

        try {
            setInprogress(true);
            setIsLoadingTwo(true)
            setErrors([])

            let data = null, system = '';
            if (typeof _value === "string") {
                data = {
                    commissions: selectedCommissions,
                    comment: _value,
                    is_accepted: true,
                    provider: selectedProviders,
                    start_date: startDate,
                    end_date: endDate
                };
            } else {
                data = {
                    commissions: selectedCommissions,
                    ..._value,
                    provider: selectedProviders,
                    start_date: startDate,
                    end_date: endDate
                };
                system = _value.system;
            }

            const result = await action(t)[nature][0](token, data, system);
            setIsIntervalFiltering(prev => !prev)
            setIsLoadingTwo(false)

            if (result?.error === null) {
                if (typeof _value !== "string") {
                    setOpened(false);
                }

                setRowSelection({});
                if(UtilMethods.isTresearer()){
                    if(result.commission.errors?.length > 0){
                        setErrors(result.commission.errors)
                        Toast.warn(t("some_errors_commissions"));
                    }else{
                        Toast.success(action(t)[nature][1]);
                    }
                }else{
                    Toast.success(action(t)[nature][1]);
                }

                promptRef.current?.close();
                paymentRef.current?.close();
                promptRef.current?.close();
                regularizepromptRef.current?.close()

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

    const handleRegularize = async _value => {
        if (!inProgress) {
            setInprogress(true);
            setIsLoadingTwo(true)
            setErrors([])
            let result = null;
            if(massPayment){
                result= await CommissionService.regularize(token,  {
                    comment: _value,
                    ...{provider: selectedProviders},
                    start_date: startDate,
                    end_date: endDate
                });
            }else{
                result = await CommissionService.regularize(token,  {
                    ..._value,
                    ...{provider: selectedProviders},
                    start_date: startDate,
                    end_date: endDate
                });
            }
            setIsIntervalFiltering(prev => !prev)
            setInprogress(false);
            setIsLoadingTwo(false)
            if (result?.error == null) {
                setRowSelection({});
                promptRef.current?.close();
                paymentRef.current?.close();
                promptRef.current?.close();
                regularizepromptRef.current?.close()
                setOpened(false)
                Toast.success(t("requestSuccessfullyPaid"));
            } else {
                displayHttpError(result?.error, router);
            }
        }
    };

    return (
        <>
            <Box sx={{mt: 2, mb: 2}}></Box>
            {!ready ? (
                <AuthorizationListingSkeleton />
            ) : (
                <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px", fontSize: '12px'}}>
                    {((errors && errors?.length > 0)  && UtilMethods.isTresearer()) && <MDAlert color="error" dismissible>
                        <div style={{display:'flex', flexDirection: 'column', maxHeight: "175px", overflowY: 'auto'}}>
                            <p >{t("errorMessageCommission")}</p>
                            <ul>
                                {errors.map((error, index) =>(
                                    <li className='' style={{paddingLeft:'12px', borderBottom:"2px solid white"}} key={index}>
                                        <ul>
                                            <li>Message{index + 1} : {Object.values(JSON.parse(error.message)).join(',')} </li>
                                            <li>Téléphone{index + 1} : {error.phone}</li>
                                        </ul>
                                    </li>)
                                )}
                            </ul>
                        </div>
                    </MDAlert>}
                    <MaterialReactTable table={mrTable}/>
                </MDBox>
            )}
            <ConfirmModal
                ref={downloadRef}
                title={t("confirmation")}
                content={t("areYouSureYouWantToExportAllData")}
                onConfirm={async () => {
                    downloadRef.current?.toggleLoader(true);
                    await tableUtils.handleDownload(columns, tableData, true, CommissionService.get);
                    downloadRef.current?.toggleLoader(false);
                    downloadRef.current?.close();
                }}
                onCancel={() => {
                    tableUtils.handleDownload(_columns, tableData);
                }}
            />
            <PromptModal
                ref={promptRef}
                title={getTitle(UtilMethods, t)}
                content={getContent(UtilMethods, t)}
                labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
                required={true}
                inProgress={inprogress}
                onSendRequest={_value => {
                    setIsRegularization(false)
                    handleSendRequest(_value)
                }}
                role={nature}
                massPayment={massPayment}
                onHandleOpenPaymentModal={() =>  setOpened(true)}
                total_amount={totalAmount}
            />
            <PromptModal
                ref={regularizepromptRef}
                title={getTitle(UtilMethods, t, true)}
                content={getContent(UtilMethods, t, true)}
                labels={{no: t("no"), yes: t("yes"), input: t("reason")}}
                required={true}
                inProgress={inprogress}
                onSendRequest={_value => {
                    setIsRegularization(true)
                    handleRegularize(_value)
                }}
                role={nature}
                massPayment={massPayment}
                onHandleOpenPaymentModal={() =>  setOpened(true)}
                total_amount={totalAmount}
            />
            <PromptPaymentModal
                refPay={paymentRef}
                labels={{no: t("no"), yes: t("yes")}}
                required={true}
                onSendRequest={_value => handleSendRequest(_value)}
                opened={opened}
                onHandleOpening={(val) => setOpened(val)}
                forCommission={true}
                isLoading={isLoadingTwo}
            />
            <PromptPaymentModal
                refPay={regularizeRef}
                labels={{no: t("no"), yes: t("yes")}}
                required={true}
                onSendRequest={_value => handleRegularize(_value)}
                opened={opened && isRegularization}
                onHandleOpening={(val) => setOpened(val)}
                title="RegularizationDialogBox"
                isLoading={isLoadingTwo}
            />
        </>
    )
}

export default CommissionPage;
