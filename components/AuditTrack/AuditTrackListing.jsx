"use client"

import React, { useCallback, useEffect, useRef, useState, useMemo } from "react"
import { useAppContext } from "@/contexts/appContext"
import TableUtils from "@/utils/table"
import {
  formatTableFilters,
  formatTableSorting,
  getLanguage,
  getStatusBadge,
  getToken,
  handleDownloadCsv,
} from "@/utils"
import { useRouter } from "next/navigation"
import { displayHttpError } from "@/utils/api"
import {
  Autocomplete,
  Box,
  Button,
  Stack,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  CircularProgress,
} from "@mui/material"
import AuthorizationListingSkeleton from "@/components/Authorization/AuthorizationListingSkeleton"
import CommissionService from "@/services/CommissionService"
import { useTranslation } from "react-i18next"
import Tooltip from "@mui/material/Tooltip"
import { CloudDownload } from "@mui/icons-material"
import styles from "@/styles/accountListing.module.scss"
import Toast from "@/utils/toast"
import Papa from "papaparse"
import * as XLSX from "xlsx"
import Link from "next/link"
import UtilMethods from "@/utils/UtilMethods"
import ConfirmModal from "@/components/ConfirmModal"
import Export from "@/services/Export"
import { BASE_URL } from "@/utils/api/api"
import axios from "axios"
import {
  MaterialReactTable,
  MRT_ShowHideColumnsButton,
  MRT_ToggleDensePaddingButton,
  MRT_ToggleFiltersButton,
  MRT_ToggleFullScreenButton,
  MRT_ToggleGlobalFilterButton,
  useMaterialReactTable,
} from "material-react-table"
import { MRT_Localization_FR } from "material-react-table/locales/fr"
import { MRT_Localization_EN } from "material-react-table/locales/en"
import IconButton from "@mui/material/IconButton"
import MDBox from "@/material/components/MDBox"
import Routes from "@/utils/routes"
import VisibilityIcon from "@mui/icons-material/Visibility"

const tableUtils = new TableUtils()

const AuditTrackListing = () => {
  const { t } = useTranslation()
  const [records, setRecords] = React.useState([])
  const [ready, setReady] = React.useState(false)
  const token = getToken()
  const router = useRouter()
  const context = useAppContext()
  const downloadRef = useRef()
  const [openArchive, setOpenArchive] = useState(false)
  const [archiveLoading, setArchiveLoading] = useState(false)
  const [openImport, setOpenImport] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [importFile, setImportFile] = useState(null)
  const [importProgress, setImportProgress] = useState(null)

  useEffect(() => {
    context.togglePageLoading(false)
  }, [])

  const [isError, setIsError] = useState(false)
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [isDeleted, setIsDeleted] = useState(false)
  const [isRefetching, setIsRefetching] = useState(false)
  const [rowCount, setRowCount] = useState(0)
  const [columnFilters, setColumnFilters] = useState([])
  const [globalFilter, setGlobalFilter] = useState("")
  const [sorting, setSorting] = useState([])
  const [rowSelection, setRowSelection] = useState({})
  const param = UtilMethods.getStatusParam()
  const resetScroll = () => {
    window.scrollTo(0, 0)
    const scrollableTableContainer = document.querySelector(".__table-container")
    if (scrollableTableContainer) {
      scrollableTableContainer.scrollTo(0, 0)
    }
  }
  const [object, setObject] = useState("all")
  const reqController = useRef(new AbortController())
  const reqCancelable = useRef(false)
  const [autocompleteValue, setAutocompleteValue] = useState(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState(new Date().toISOString().split("T")[0])
  const [appliedStartDate, setAppliedStartDate] = useState(null)
  const [appliedEndDate, setAppliedEndDate] = useState(null)
  const today = new Date().toISOString().split("T")[0]
  const isRangeApplied = useMemo(
    () => !!appliedStartDate && !!appliedEndDate && appliedStartDate !== appliedEndDate,
    [appliedStartDate, appliedEndDate],
  )
  // allow using the currently selected input dates if user hasn't pressed "Filtrer"
  const hasInputRange = useMemo(() => !!startDate && !!endDate && startDate !== endDate, [startDate, endDate])
  const modalRangeStart = isRangeApplied ? appliedStartDate : hasInputRange ? startDate : null
  const modalRangeEnd = isRangeApplied ? appliedEndDate : hasInputRange ? endDate : null
  const [options, setOptions] = useState([
    { value: "account", label: t("account") },
    { value: "access", label: t("access") },
    { value: "subscription", label: t("subscription") },
    { value: "redemption", label: t("redemption") },
    { value: "contract", label: t("contract") },
    { value: "commission", label: t("commission") },
    { value: "collection", label: t("collection") },
    { value: "provider", label: t("provider") },
    { value: "password", label: t("password") },
  ])

  // request all providers
  const getAudits = useCallback(async () => {
    if (reqCancelable.current) {
      try {
        reqController.current.abort()
      } catch (e) {}
      reqCancelable.current = false
      reqController.current = new AbortController()
    }

    if (!records.length) {
      setIsLoading(true)
    } else {
      setIsRefetching(true)
    }
    const config = {
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      signal: reqController.current.signal,
    }

    const url = new URL(`${BASE_URL}/log`)
    const filters = formatTableFilters(columnFilters)
    const sortingTab = formatTableSorting(sorting)
    url.searchParams.set("start", `${pagination.pageIndex * pagination.pageSize}`)
    url.searchParams.set("per_page", `${pagination.pageSize}`)
    url.searchParams.set("filters", JSON.stringify(filters))
    url.searchParams.set("q", globalFilter ?? "")
    url.searchParams.set("sorting", JSON.stringify(sortingTab))

    if (object) {
      const data = object === "all" ? "" : object
      url.searchParams.set("type", data)
      url.searchParams.set("filters", JSON.stringify({ ...filters, type: data }))
    }

    if (Object.keys(filters).length > 0 && !Object.hasOwnProperty("status")) {
      UtilMethods.setStatusParam("")
      url.searchParams.set("status", "")
    }

    if (Object.keys(filters).length <= 0 && param !== null) {
      url.searchParams.set("status", param)
    }

    // apply date range filter when set
    if (appliedStartDate && appliedEndDate && appliedStartDate !== appliedEndDate) {
      url.searchParams.set("start_date", appliedStartDate)
      url.searchParams.set("end_date", appliedEndDate)
    }

    try {
      reqCancelable.current = true
      const response = await axios.get(url.href, config)
      if (response.status === 200) {
        setRecords(response.data.data.logs)
        setRowCount(response.data.data.pagination.total)
      }
      resetScroll()
    } catch (error) {
      if (error.code && error.code === "ERR_CANCELED") {
        return
      }
      setIsError(true)
      console.error(error)
      displayHttpError(error, router)
      return
    }
    setIsError(false)
    setIsLoading(false)
    setIsRefetching(false)
    setReady(true)
    reqCancelable.current = false
    reqController.current = new AbortController()
  }, [
    columnFilters,
    globalFilter,
    pagination.pageIndex,
    pagination.pageSize,
    sorting,
    param,
    object,
    appliedStartDate,
    appliedEndDate,
  ])

  const handleArchive = useCallback(async () => {
    try {
      setArchiveLoading(true)
      const url = new URL(`${BASE_URL}/log/archive`)
      // prefer applied range, else fallback to current input range
      let s = null,
        e = null
      if (isRangeApplied) {
        s = appliedStartDate
        e = appliedEndDate
      } else if (hasInputRange) {
        s = startDate
        e = endDate
      }
      if (s && e) {
        url.searchParams.set("start_date", s)
        url.searchParams.set("end_date", e)
      }

      // Start archive job
      const resp = await axios.get(url.href, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
      })
      const jobId = resp?.data?.data?.job_id
      if (!jobId) {
        throw new Error(t("archiveJobIdMissing"))
      }

      // Poll for completion (simple check every 3 seconds)
      const pollInterval = setInterval(async () => {
        try {
          const statusUrl = new URL(`${BASE_URL}/log/archive-status`)
          statusUrl.searchParams.set("job_id", jobId)
          const statusResp = await axios.get(statusUrl.href, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
          })
          const progress = statusResp?.data?.data

          if (progress?.status === "completed") {
            clearInterval(pollInterval)

            // Download the file
            const downloadUrl = new URL(`${BASE_URL}/log/archive-download`)
            downloadUrl.searchParams.set("job_id", jobId)
            const downloadResp = await axios.get(downloadUrl.href, {
              headers: { Authorization: `Bearer ${token}` },
              responseType: "blob",
            })

            const cd = downloadResp.headers["content-disposition"] || ""
            const match = cd.match(/filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i)
            const filename = (match && decodeURIComponent(match[1] || match[2])) || `logs_archive.zip`

            const blob = new Blob([downloadResp.data], { type: "application/zip" })
            const link = document.createElement("a")
            link.href = window.URL.createObjectURL(blob)
            link.download = filename
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            Toast.success(t("archiveDownloadSuccess"))
            setArchiveLoading(false)
            setOpenArchive(false)
            await getAudits()
          } else if (progress?.status === "failed") {
            clearInterval(pollInterval)
            setArchiveLoading(false)
            Toast.error(progress.message || t("archiveFailed"))
          }
        } catch (err) {
          clearInterval(pollInterval)
          setArchiveLoading(false)
          console.error(err)
          displayHttpError(err, router)
        }
      }, 3000)
    } catch (error) {
      console.error(error)
      displayHttpError(error, router)
      setArchiveLoading(false)
    }
  }, [isRangeApplied, appliedStartDate, appliedEndDate, startDate, endDate, token, router, getAudits, t])

  const handleImport = useCallback(async () => {
    if (!importFile) return
    try {
      setImportLoading(true)
      setImportProgress({ percentage: 0, message: t("importStarting"), processed: 0, total: 0 })

      const ext = importFile.name.split(".").pop().toLowerCase()
      let allLogs = []

      // Parse file based on extension
      if (ext === "csv" || ext === "txt") {
        allLogs = await parseCSV(importFile)
      } else if (ext === "xlsx" || ext === "xls") {
        allLogs = await parseExcel(importFile)
      } else {
        throw new Error(t("unsupportedFileType"))
      }

      if (!allLogs || allLogs.length === 0) {
        throw new Error(t("emptyFile"))
      }

      console.log("[v0] Import started with", allLogs.length, "logs")

      setImportProgress({
        percentage: 5,
        message: t("importParsed", { count: allLogs.length }),
        processed: 0,
        total: allLogs.length,
      })

      const CHUNK_SIZE = 500 // Smaller chunks for more frequent updates
      const totalChunks = Math.ceil(allLogs.length / CHUNK_SIZE)
      let processedLogs = 0

      console.log("[v0] Total chunks to process:", totalChunks)

      // Process chunks sequentially for predictable progress
      for (let i = 0; i < totalChunks; i++) {
        const start = i * CHUNK_SIZE
        const end = Math.min((i + 1) * CHUNK_SIZE, allLogs.length)
        const rawChunk = allLogs.slice(start, end)

        // Slim payload: remove null/undefined/empty-string fields
        const chunk = rawChunk.map((item) => {
          const out = {}
          Object.keys(item).forEach((k) => {
            const v = item[k]
            if (v !== null && v !== undefined && !(typeof v === "string" && v.trim() === "")) {
              out[k] = v
            }
          })
          return out
        })

        console.log("[v0] Processing chunk", i + 1, "of", totalChunks)

        const resp = await axios.post(
          `${BASE_URL}/log/import-chunk`,
          { logs: chunk },
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        )

        const result = resp?.data?.data || {}
        processedLogs += result.processed || chunk.length

        // Calculate progress: 5% for parsing, 5-95% for processing, 100% at end
        const processingProgress = Math.floor((processedLogs / allLogs.length) * 90)
        const percentage = Math.min(95, 5 + processingProgress)

        console.log("[v0] Progress:", percentage + "%", `(${processedLogs}/${allLogs.length})`)

        setImportProgress({
          percentage,
          message: t("importProcessingChunk", {
            current: processedLogs,
            total: allLogs.length,
          }),
          processed: processedLogs,
          total: allLogs.length,
        })

        // Give browser time to render the progress update
        await new Promise((r) => setTimeout(r, 100))
      }

      console.log("[v0] Import completed successfully")

      setImportProgress({
        percentage: 100,
        message: t("importCompleted"),
        processed: allLogs.length,
        total: allLogs.length,
      })

      Toast.success(t("importCompleted"))

      // Wait a moment to show 100% before closing
      await new Promise((r) => setTimeout(r, 500))

      setImportLoading(false)
      setOpenImport(false)
      setImportFile(null)
      setImportProgress(null)
      await getAudits()
    } catch (error) {
      console.error("[v0] Import error:", error)
      setImportLoading(false)
      setImportProgress(null)
      if (error.message) {
        Toast.error(error.message)
      } else {
        displayHttpError(error, router)
      }
    }
  }, [importFile, token, router, getAudits, t])

  const parseCSV = (file) => {
    return new Promise((resolve, reject) => {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          try {
            const logs = results.data
              .map((row) => ({
                LOG_UID: row.LOG_UID || row.log_uid,
                LOG_TYPE: row.LOG_TYPE || row.log_type || null,
                LOG_DATE: row.LOG_DATE || row.log_date || null,
                LOG_USER_UID: row.LOG_USER_UID || row.log_user_uid || row.USER_UID || null,
                LOG_ACTION: row.LOG_ACTION || row.log_action || null,
                LOG_ITEM_UID: row.LOG_ITEM_UID || row.log_item_uid || null,
                LOG_DESCRIPTION: row.LOG_DESCRIPTION || row.log_description || null,
                LOG_PAGE: row.LOG_PAGE || row.log_page || null,
                LOG_RESULT: row.LOG_RESULT || row.log_result || null,
                LOG_ERROR: row.LOG_ERROR || row.log_error || null,
                LOG_DEVICE_INFO: row.LOG_DEVICE_INFO || row.log_device_info || null,
                LOG_OLD_VALUE: row.OLD_VALUE || row.LOG_OLD_VALUE || row.old_value || null,
                LOG_NEW_VALUE: row.NEW_VALUE || row.LOG_NEW_VALUE || row.new_value || null,
              }))
              .filter((log) => log.LOG_UID) // Filter out rows without UID
            resolve(logs)
          } catch (err) {
            reject(err)
          }
        },
        error: (error) => reject(error),
      })
    })
  }

  const parseExcel = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result)
          const workbook = XLSX.read(data, { type: "array" })
          const sheetName = workbook.SheetNames[0]
          const sheet = workbook.Sheets[sheetName]
          const jsonData = XLSX.utils.sheet_to_json(sheet)

          const logs = jsonData
            .map((row) => ({
              LOG_UID: row.LOG_UID || row.log_uid,
              LOG_TYPE: row.LOG_TYPE || row.log_type || null,
              LOG_DATE: row.LOG_DATE || row.log_date || null,
              LOG_USER_UID: row.LOG_USER_UID || row.log_user_uid || row.USER_UID || null,
              LOG_ACTION: row.LOG_ACTION || row.log_action || null,
              LOG_ITEM_UID: row.LOG_ITEM_UID || row.log_item_uid || null,
              LOG_DESCRIPTION: row.LOG_DESCRIPTION || row.log_description || null,
              LOG_PAGE: row.LOG_PAGE || row.log_page || null,
              LOG_RESULT: row.LOG_RESULT || row.log_result || null,
              LOG_ERROR: row.LOG_ERROR || row.log_error || null,
              LOG_DEVICE_INFO: row.LOG_DEVICE_INFO || row.log_device_info || null,
              LOG_OLD_VALUE: row.OLD_VALUE || row.LOG_OLD_VALUE || row.old_value || null,
              LOG_NEW_VALUE: row.NEW_VALUE || row.LOG_NEW_VALUE || row.new_value || null,
            }))
            .filter((log) => log.LOG_UID) // Filter out rows without UID

          resolve(logs)
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = (error) => reject(error)
      reader.readAsArrayBuffer(file)
    })
  }

  //Fetch data on mount and when the value changes
  useEffect(() => {
    getAudits()
  }, [getAudits, isDeleted])

  const tableData = (records) => {
    return records?.map((record) => ({
      uid: record?.uid,
      type: record?.type,
      action: record?.action,
      user: `${record?.user?.last_name || ""} ${record?.user?.first_name || ""}`,
      result: record?.result,
      date: record?.created_at,
      actions: (
        <Tooltip title={t("showDetails")} placement="bottom">
          <Link href={Routes.AUDIT_DETAILS(record?.uid)}>
            <VisibilityIcon
              onClick={() => {
                context.togglePageLoading(true)
              }}
              color="secondary"
              className={styles.clickableIcon}
            />
          </Link>
        </Tooltip>
      ),
    }))
  }

  const lg = getLanguage()
  const _columns = useMemo(
    () => [
      {
        accessorKey: "type", //access nested data with dot notation
        header: t("object"),
        size: 100,
        enableColumnFilter: false,
      },
      {
        accessorKey: "action",
        header: t("action"),
        size: 70,
        filterVariant: "select",
        filterSelectOptions: [
          { label: t("create"), value: "create" },
          { label: t("update"), value: "update" },
          { label: t("delete"), value: "delete" },
          { label: t("clone"), value: "clone" },
          { label: t("reset"), value: "reset" },
          { label: t("deactivate"), value: "deactivate" },
          { label: t("reactivate"), value: "reactivate" },
          { label: t("suspend"), value: "suspend" },
          { label: t("amendment"), value: "amendment" },
          { label: t("reassign"), value: "reassign" },
          { label: t("transfer"), value: "transfer" },
          { label: t("sendCode"), value: "sendCode" },
          { label: t("confirm"), value: "confirm" },
        ],
      },
      {
        accessorKey: "user",
        header: t("modifier"),
        size: 70,
        muiFilterTextFieldProps: ({ column, rangeFilterIndex, table }) => ({
          inputProps: { placeHolder: t("filter") },
        }),
      },
      {
        accessorKey: "result",
        header: t("result"),
        Cell: ({ cell }) => getStatusBadge(cell.getValue(), t),
        size: 70,
        filterVariant: "select",
        filterSelectOptions: [
          { label: t("success"), value: "success" },
          { label: t("failure"), value: "failure" },
        ],
      },
      {
        accessorKey: "date",
        header: t("date"),
        size: 70,
        enableColumnFilter: true,
        filterFn: "equals",
        // fully-controlled custom filter input to persist date value
        Filter: ({ column }) => (
          <TextField
            type="date"
            variant="filled"
            value={column.getFilterValue() ?? ""}
            onChange={(e) => column.setFilterValue(e.target.value || undefined)}
            inputProps={{ max: today }}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
        ),
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
  )

  const mrTable = useMaterialReactTable({
    columns: _columns,
    data: tableData(records),
    enableRowSelection: (row) => {
      return row.original.id !== undefined
    },
    enableStickyHeader: true,
    initialState: {
      showColumnFilters: true,
      density: "compact",
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiTablePaperProps: { className: "__table-expandable" },
    muiTableContainerProps: { className: "__table-container" },
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
    renderTopToolbarCustomActions: ({ table }) => (
      <Stack gap={2}>
        <Box sx={{ fontSize: "12px", fontWeight: "bolder" }}>{getTitleContext(object, t)}</Box>
        {UtilMethods.isAdmin() && (
          <Stack direction="row" alignItems="center" gap={2}>
            <Stack direction="row" alignItems="center" gap={2}>
              <TextField
                onChange={(e) => {
                  setStartDate(e.target.value.trim())
                }}
                value={startDate}
                variant="filled"
                type="date"
                label={`${t("startDate")}*`}
                error={startDate === ""}
                sx={{ width: "100%" }}
                size="normal"
                style={{ minWidth: "150px!important" }}
                inputProps={{ max: today }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                onChange={(e) => {
                  setEndDate(e.target.value.trim())
                }}
                value={endDate}
                variant="filled"
                type="date"
                label={`${t("endDate")}`}
                sx={{ width: "100%" }}
                size="normal"
                style={{ minWidth: "150px!important" }}
                inputProps={{ max: today }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>

            <Button
              disabled={startDate === ""}
              style={{ marginLeft: "12px" }}
              variant="outlined"
              onClick={handleDownloadResources}
            >
              {t("export")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              style={{ marginLeft: "8px" }}
              disabled={!(startDate && endDate && startDate !== endDate)}
              onClick={() => {
                setAppliedStartDate(startDate)
                setAppliedEndDate(endDate)
                setPagination((p) => ({ ...p, pageIndex: 0 }))
              }}
            >
              {t("filter")}
            </Button>
            <Button
              variant="text"
              color="secondary"
              style={{ marginLeft: "4px" }}
              onClick={() => {
                // clear local date inputs
                setStartDate("")
                setEndDate(today)
                // clear applied date filters
                setAppliedStartDate(null)
                setAppliedEndDate(null)
                // clear table filters/selections
                setColumnFilters([])
                setGlobalFilter("")
                setSorting([])
                setRowSelection({})
                // clear object filter
                setObject("all")
                setAutocompleteValue(null)
                // reset to first page and refetch
                setPagination((p) => ({ ...p, pageIndex: 0 }))
              }}
            >
              {t("reset")}
            </Button>
            <Button
              variant="contained"
              color="error"
              style={{ marginLeft: "8px" }}
              onClick={() => setOpenArchive(true)}
            >
              {t("archive", { defaultValue: "Archiver" })}
            </Button>
            <Button
              variant="contained"
              color="secondary"
              style={{ marginLeft: "8px" }}
              onClick={() => setOpenImport(true)}
            >
              {t("import", { defaultValue: "Importer" })}
            </Button>
          </Stack>
        )}
      </Stack>
    ),
    renderToolbarInternalActions: ({ table }) => {
      return (
        <Box>
          <MRT_ToggleGlobalFilterButton table={table} />
          <MRT_ToggleFiltersButton table={table} />
          <IconButton
            onClick={() => {
              const selectedRows = table.getSelectedRowModel().rows ?? []
              const tab = selectedRows.reduce((acc, item) => {
                acc.push(records[item.id])
                return acc
              }, [])
              const exportableRows = tab.length > 0 ? tab : records
              handleDownloadCsv(_columns, tableData(exportableRows))
            }}
          >
            <CloudDownload />
          </IconButton>
          <MRT_ToggleDensePaddingButton table={table} />
          <MRT_ShowHideColumnsButton table={table} />
          <MRT_ToggleFullScreenButton table={table} />
        </Box>
      )
    },
    muiPaginationProps: {
      rowsPerPageOptions: [10, 20, 50, 100, { label: t("all"), value: rowCount }],
    },
  })

  const handleDownloadResources = async () =>
    await Export.stream(token, context, router, "logs", "", startDate, endDate)

  return (
    <>
      <Box sx={{ mt: 2, mb: 2 }}>
        <Stack direction="row" sx={{ display: "flex", alignItems: "center" }} spacing={2}>
          <Button
            variant="contained"
            onClick={() => {
              setObject("all")
              setAutocompleteValue(null) // Reset the autocomplete value
            }}
            color={object === "all" ? "primary" : "light"}
            className="__flex_item __right __text-transform-none"
            style={{ height: "55px", paddingLeft: "24px", paddingRight: "24px" }}
          >
            {t("all")}
          </Button>
          <Autocomplete
            disablePortal
            id="options"
            value={autocompleteValue} // Manage the value of the autocomplete
            onChange={(e, item) => {
              setObject(item?.value ?? "all")
              setAutocompleteValue(item)
            }}
            getOptionLabel={(opt) => String(opt.label)}
            isOptionEqualToValue={(_option, _item) => _option.value === _item.value}
            options={options}
            style={{ width: "300px" }}
            renderInput={(params) => <TextField {...params} label={t("filterByObject")} variant="filled" />}
          />
        </Stack>
      </Box>
      {!ready ? (
        <AuthorizationListingSkeleton />
      ) : (
        <MDBox bgColor="white" mb={2} sx={{ borderRadius: "8px" }}>
          <MaterialReactTable table={mrTable} />
        </MDBox>
      )}
      <ConfirmModal
        ref={downloadRef}
        title={t("confirmation")}
        content={t("areYouSureYouWantToExportAllData")}
        onConfirm={async () => {
          downloadRef.current?.toggleLoader(true)
          await tableUtils.handleDownload(_columns, tableData, true, CommissionService.get)
          downloadRef.current?.toggleLoader(false)
          downloadRef.current?.close()
        }}
        onCancel={() => {
          tableUtils.handleDownload(_columns, tableData)
        }}
      />
      {/* Archive confirmation dialog */}
      <Dialog open={openArchive} onClose={() => !archiveLoading && setOpenArchive(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{t("confirmation", { defaultValue: "Confirmation" })}</DialogTitle>
        <DialogContent>
          {!archiveLoading ? (
            <>
              {modalRangeStart && modalRangeEnd ? (
                <>
                  <Box sx={{ mt: 1 }}>
                    {t("archivingWillExportAndWipeRange", {
                      defaultValue: "L'archive va contenir les logs du {{start}} au {{end}}.",
                      start: modalRangeStart,
                      end: modalRangeEnd,
                    })}
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {t("archivingCleanupRangeInfo", {
                      defaultValue:
                        "Après l'archivage, la base de données sera nettoyée pour cette plage (de {{start}} 00:00:00 à {{end}} 23:59:59).",
                      start: modalRangeStart,
                      end: modalRangeEnd,
                    })}
                  </Box>
                </>
              ) : (
                <>
                  <Box sx={{ mt: 1 }}>
                    {t("archivingWillExportAndWipeAll", {
                      defaultValue: "L'archive va contenir l'intégralité des logs.",
                    })}
                  </Box>
                  <Box sx={{ mt: 1 }}>
                    {t("archivingCleanupAllInfo", {
                      defaultValue: "Après l'archivage, la base de données des logs sera entièrement vidée.",
                    })}
                  </Box>
                </>
              )}
            </>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 3, mb: 3 }}>
              <CircularProgress size={60} />
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {t("archiveProcessing")}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenArchive(false)} disabled={archiveLoading}>
            {t("cancel", { defaultValue: "Annuler" })}
          </Button>
          {!archiveLoading && (
            <Button onClick={handleArchive} color="error" variant="contained">
              {t("confirm", { defaultValue: "Confirmer" })}
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Import modal */}
      <Dialog open={openImport} onClose={() => !importLoading && setOpenImport(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {importLoading ? t("importInProgress") : t("confirmation", { defaultValue: "Confirmation" })}
        </DialogTitle>
        <DialogContent>
          {!importLoading ? (
            <>
              <Box sx={{ mt: 1 }}>
                {t("importLogsInfo", {
                  defaultValue:
                    "Sélectionnez un fichier des logs exportés (csv/xlsx/xls). Les dates seront restaurées telles qu'exportées.",
                })}
              </Box>
              <Box sx={{ mt: 2 }}>
                <input
                  type="file"
                  accept=".csv,.txt,.xlsx,.xls"
                  onChange={(e) => setImportFile(e.target.files?.[0] ?? null)}
                />
              </Box>
            </>
          ) : (
            <Box sx={{ mt: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {importProgress?.message || t("importProcessing")}
              </Typography>
              <Box
                sx={{
                  width: "100%",
                  height: 8,
                  backgroundColor: "#e0e0e0",
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <Box
                  sx={{
                    width: `${importProgress?.percentage || 0}%`,
                    height: "100%",
                    background: "linear-gradient(195deg, #0d6732, #0d6732)",
                    transition: "width 0.3s ease-in-out",
                  }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                {importProgress?.percentage || 0}%{" "}
                {importProgress?.processed && importProgress?.total
                  ? `(${importProgress.processed}/${importProgress.total})`
                  : ""}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenImport(false)} disabled={importLoading}>
            {t("cancel", { defaultValue: "Annuler" })}
          </Button>
          {!importLoading && (
            <Button onClick={handleImport} variant="contained" disabled={!importFile}>
              {t("confirm", { defaultValue: "Confirmer" })}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  )
}

export default AuditTrackListing

const getTitleContext = (_object = "all", t) => {
  switch (_object) {
    case "account":
      return t("allAccountLogs")
    case "access":
      return t("allAccessLogs")
    case "subscription":
      return t("allSubscriptionLogs")
    case "redemption":
      return t("allRedemptionLogs")
    case "contract":
      return t("allContractLogs")
    case "commission":
      return t("allCommissionLogs")
    case "collection":
      return t("allCollectionLogs")
    case "provider":
      return t("allProviderLogs")
    case "password":
      return t("allPasswordLogs")
    default:
      return t("allLogs")
  }
}
