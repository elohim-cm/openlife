"use client";

import React, {useCallback, useEffect, useState, useMemo} from "react";
import {deleteRole, getAllRoles} from "@/services/roleService";
import Link from "next/link";
import styles from "@/styles/accountListing.module.scss";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
} from "@mui/material";
import {useRouter} from "next/navigation";
import Toast from "@/utils/toast";
import ActivityIndicator from "@/components/ActivityIndicator";
import {
  formatTableFilters,
  formatTableSorting, getLanguage,
  getToken,
  handleDownloadCsv
} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import {displayHttpError} from "@/utils/api";
import {ROLE_CREATE, ROLE_UPDATE} from "@/utils/routes/routes";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import {CloudDownload} from "@mui/icons-material"
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
import IconButton from "@mui/material/IconButton";
import MDBox from "@/material/components/MDBox";
import {MRT_Localization_FR} from "material-react-table/locales/fr";
import {MRT_Localization_EN} from "material-react-table/locales/en";

const RolesListing = () => {
  // role state
  const [roles, setRoles] = useState([]);
  const [inProgress, setInProgress] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [currentRole, setCurrentRole] = useState("");    
  const [isError, setIsError] = useState(false);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  const [isDeleted, setIsDeleted] = useState(false);
  const router = useRouter();
  const context = useAppContext();
  const {t} = useTranslation();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  const token = getToken();

  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);
  const [columnFilters, setColumnFilters] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [ready, setReady] = useState(false);
  const resetScroll = () => {
    window.scrollTo(0, 0);
    const scrollableTableContainer = document.querySelector(".__table-container");
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0);
    }
  };
  // request all providers
  const getRoles = useCallback(
    async () => {
      if (!roles.length) {
        setIsLoading(true);
      } else {
        setIsRefetching(true);
      }
      const config = {
        headers: {Authorization: `Bearer ${token}`, Accept: "application/json"},
      };

      const url = new URL(`${BASE_URL}/role`);
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
          setRoles(response.data.data.roles);
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
    [columnFilters, globalFilter, pagination.pageIndex, pagination.pageSize, sorting],
  );

  //Fetch data on mount and when the value changes
  useEffect(() => {
    getRoles();
  }, [getRoles, isDeleted]);
  
  const handleDeleteRole = async () => {
    setInProgress(true);
    let result = await deleteRole(token, currentRole);
    if (!result.error) {
      Toast.success(t("roleDeletedSuccessfully"));
      setIsDeleted(prev => !prev)
      setDeleteModal(false);
    } else {
      displayHttpError(result.error, router);
    }
    setInProgress(false);
  };

  let tableData = () => {
    return roles?.map(role => ({
      code: role.code,
      // label: UtilMethods.roleMatching(t)[role.code],
      label: role.role_label,
      description: role.description,
      actions: (
        <Stack direction="row" spacing={1}>
          <Link
            href={ROLE_UPDATE(role.uid)}
            onClick={() => {
              context.togglePageLoading();
            }}>
            <EditIcon color="primary" className={styles.clickableIcon} />
          </Link>
          <DeleteIcon
            onClick={() => {
              setCurrentRole(role.uid);
              setDeleteModal(true);
            }}
            color="error"
            className={styles.clickableIcon}
          />
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
        accessorKey: "label",
        header: t("label"),
        size: 150,
        muiFilterTextFieldProps: ({column, rangeFilterIndex, table}) => ({
          inputProps: {placeHolder: t("filter")},
        }),
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
    data: tableData(roles),
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
        {UtilMethods.getHabilitations(authorizations, 'role').canCreate && <Button
          variant="contained"
          onClick={() => {
            context.togglePageLoading(true);
            router.push(ROLE_CREATE);
          }}
          className="__flex_item __right __text-transform-none">
          {t("createANewRole")}
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
              acc.push(roles[item.id]);
              return acc;
            }, []);
            const exportableRows = tab.length > 0 ? tab : roles;
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
      {!ready? (
        <TableSkeleton rowsNumber={4} />
      ) : (
          <>
            <Box sx={{mt: 2, mb: 2}}></Box>
            <MDBox bgColor="white" mb={2} sx={{borderRadius: "8px"}}>
              <MaterialReactTable table={mrTable} />
            </MDBox>
          </>
      )}
      <Dialog className="__positionned" open={deleteModal} onClose={() => setDeleteModal(false)}>
        <ActivityIndicator visible={inProgress} />
        <DialogTitle>{t("confirmation")}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t("areYouSureYouWantToDeleteThisItem")}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteModal(false)}>{t("no")}</Button>
          <Button onClick={handleDeleteRole} autoFocus>
            {t("yes")}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RolesListing;
