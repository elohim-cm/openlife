import React, {useState} from 'react';
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {Box, Button, Tooltip, Typography} from "@mui/material";
import Routes from "@/utils/routes";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import SubscriptionService from "@/services/SubscriptionService";
import MUIDataTable from "mui-datatables";
import TableUtils from "@/utils/table";

const tableUtils = new TableUtils()
export default function DataTables({ type, resources, pagination, isLoading, tableTitle, columns, tableData, selectedResources,setSelectedResources, onTableChange}) {
  const [qContract,setqContract] =  useState('');
  return (
    <>
      {type === "clients" ? (
        <Box>
          <Box sx={{mt: 2, mb: 2}}>
            <div className="__flex-row">
              <Typography variant="h5">Toutes les  {tableTitle}</Typography>
            </div>
          </Box>
          <MUIDataTable
            className="brMd"
            options={{
              setTableProps: () => {
                return {
                  size: "medium",
                };
              },
              onSearchChange: async (q) => {
                setqContract(String(q || '').trim())
                onTableChange(0, String(q || '').trim())
              },
              serverSide: true,
              elevation: 1,
              onChangePage: currentPage => onTableChange(currentPage, qContract),
              rowsPerPage: pagination.per_page ? pagination.per_page : 10,
              count: pagination.total ? pagination.total : 23,
              textLabels: textLabels,
            }}
            columns={columns}
            data={tableData}
            // Apply custom style for thead
            style={{ '& thead': { fontWeight: 'bold' } }}
          />

        </Box>
      ) : (
        <Box>
          <Box sx={{mt: 2, mb: 2}}>
            <div className="__flex-row">
              <Typography variant="h5">Toutes les {tableTitle}</Typography>
            </div>
          </Box>
          <MUIDataTable
            // title={tableTitle}
            className="brMd"
            options={{
              setTableProps: () => {
                return {
                  size: "medium",
                };
              },
              selectableRows: "multiple",
              elevation: 1,
              serverSide: true,
              onSearchChange: async (q) => {
                setqContract(String(q || '').trim())
                onTableChange(0, String(q || '').trim())
              },
              onChangePage: currentPage => onTableChange(currentPage, qContract),
              rowsPerPage: pagination?.per_page ? pagination?.per_page : 10,
              count: pagination?.total ? pagination?.total : null,
              onRowSelectionChange: (currentRowsSelected, allRowsSelected, rowsSelected) =>
                setSelectedResources(rowsSelected),
              rowsSelected: selectedResources,
            }}
            columns={columns}
            data={tableData}
          />

        </Box>
      )}
    </>
  );
}