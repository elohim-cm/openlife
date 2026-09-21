"use client";

import React, {useCallback, useEffect, useState, useMemo} from "react";
import {deleteAccount, getAllAccounts, getNextAccountsPage} from "@/services/accountService";
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
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import {useTheme} from "@mui/material/styles";
import Link from "next/link";
import styles from "@/styles/accountListing.module.scss";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {WALLET_DETAILS, WALLET_UPDATE
} from "@/utils/routes/routes";
import Tooltip from "@mui/material/Tooltip";
import {useParams, useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";
import {canInterprateError, displayHttpError} from "@/utils/api";
import {CloudDownload, Visibility} from "@mui/icons-material";
import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import {useTranslation} from "react-i18next";
import Export from "@/services/Export";
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
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";
import IconButton from "@mui/material/IconButton";
import MDBox from "@/material/components/MDBox";

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

const WalletListing = () => {
    const {t} = useTranslation();
    const theme = useTheme()
    const [peoples, setPeoples] = useState([]);
    const router = useRouter();
    const context = useAppContext();
    const {token, authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
    const titleArray = t => ([
        {clients: t("customers")},
        {prospects: t("prospects")}
    ]);

    const columns = t => ([
        {name: "code", label: t('code')},
        {name: "last_name", label: t('lastName')},
        {name: "first_name", label: t('firstName')},
        {name: "email", label: t('email')},
        {name: "main_phone", label: t('mainPhone')},
        {name: "secondary_phone", label: t('secondaryPhone')},
        {name: "actions", label: "Actions", filter: false, sort: false},
    ]);
    const [value, setValue] = React.useState(0);
    const [key, setKey] = React.useState('clients');

    const handleChange = (event, newValue) => {
        const foundKey = Object.keys(titleArray(t)[newValue])[0]
        setValue(newValue);
        setKey(foundKey);
        console.log(foundKey, newValue)
    };


    const [isError, setIsError] = useState(false);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [isRefetching, setIsRefetching] = useState(false);
    const [rowCount, setRowCount] = useState(0);
    const [columnFilters, setColumnFilters] = useState([]);
    const [globalFilter, setGlobalFilter] = useState("");
    const [sorting, setSorting] = useState([]);
    const [rowSelection, setRowSelection] = useState({});
    const [ready, setReady] = useState(false)

    const endpointsArray = ['customers', 'prospects'];
    // request all providers
    const getPeoples = useCallback(
      async () => {
          if (!peoples.length) {
              setIsLoading(true);
          } else {
              setIsRefetching(true);
          }
          const config = {
              headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
          };
          const endpoint = endpointsArray[value]

          const url = new URL(`${BASE_URL}/wallet/${endpoint}`);
          const filters = formatTableFilters(columnFilters);
          const sortingTab = formatTableSorting(sorting);
          url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`);
          url.searchParams.set("per_page", `${pagination.pageSize}`);
          url.searchParams.set("filters", JSON.stringify(filters));
          url.searchParams.set("q", globalFilter ?? "");
          url.searchParams.set("sorting", JSON.stringify(sortingTab));

          try {
              const response = await axios.get(url.href, config);
              if (response.status === 200) {
                  setPeoples(response.data.data.person);
                  setRowCount(response.data.data.pagination.total);
              }
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
      [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting, value],
    );

    //Fetch data on mount and when the value changes
    useEffect(() => {
        getPeoples();
    }, [getPeoples, value]);

    //  table data
    let tableData = (peoples) => {
        return peoples?.map(people => {
            return {
                code: people.code || '',
                last_name: people.last_name || '',
                first_name: people.first_name|| '',
                email: people.email,
                main_phone: people.main_phone,
                secondary_phone: people.secondary_phone,
                actions: (
                    !(String(people.first_name || '').includes('System') && String(people.last_name || '').includes('SYSTEM'))  &&
                    (<Stack direction="row" spacing={1}>
                            <Tooltip title={t("viewDetails")} placement="bottom">
                                <Link href={WALLET_DETAILS(people.uid, key)}>
                                    <Visibility
                                        color="primary"
                                        className={styles.clickableIcon}
                                        onClick={e => context.togglePageLoading(true)}
                                    />
                                </Link>
                            </Tooltip>
                        { <Tooltip title={t("update")} placement="bottom">
                            <Link href={WALLET_UPDATE(people.uid, endpointsArray[value])}>
                                <EditIcon
                                    color="primary"
                                    className={styles.clickableIcon}
                                    onClick={e => context.togglePageLoading(true)}
                                />
                            </Link>
                        </Tooltip>}
                    </Stack>)
                ),
            };
        });
    };

    const handleDownloadResources = async () => {
        const resourceType = value === 0 ? 'customers' : 'prospects';
        await Export.download(token, context, router, resourceType);
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
              accessorKey: "email",
              header: t("email"),
              size: 150,
              muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
                  inputProps: {placeHolder: t("filter")},
              }),
          },
          {
              accessorKey: "main_phone",
              header: t("mainPhone"),
              size: 150,
              muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
                  inputProps: {placeHolder: t("filter")},
              }),
          },
          {
              accessorKey: "secondary_phone",
              header: t("secondaryPhone"),
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
        data: tableData(peoples),
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
              {((UtilMethods.isAdmin() || UtilMethods.isCustomerService() || UtilMethods.isTechnicalReferent()) || UtilMethods.getHabilitations(authorizations, 'relationships').canExport) && <Button
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
                        acc.push(peoples[item.id]);
                        return acc;
                    }, []);
                    const exportableRows = tab.length > 0 ? tab : peoples;
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
            <Box sx={{ width: '100%', mt:1}}>
                <Box >
                    <AntTabs value={value} onChange={handleChange} aria-label="ant example">
                        <AntTab label={t("customers")} />
                        <AntTab label={t("prospects")} />
                    </AntTabs>
                    <Box className="__content-wrapper">
                        {!ready ? (
                            <TableSkeleton rowsNumber={5} />
                        ) : (
                            <>
                                <Box sx={{mt: 2, mb: 2}}></Box>
                                <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
                                    <MaterialReactTable table={mrTable} />
                                </MDBox>
                            </>
                        )}
                    </Box>
                </Box>
            </Box>
        </>
    );
};

export default WalletListing;

function findKeyByValue(obj, value) {
    for (const key in obj) {
        if (obj.hasOwnProperty(key) && obj[key] === value) {
            return key;
        }
    }
    return null; // Retourne null si la valeur n'est pas trouvée
}