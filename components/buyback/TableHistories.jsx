import React, {useState} from "react";
import MDBox from "@/material/components/MDBox";
import {Stack, Tooltip} from "@mui/material";
import MUIDataTable from "mui-datatables";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import BusinessGoal from "@/services/BusinessGoal";
import ContractService from "@/services/ContractService";
import {formatNumber, getStatusBadge} from "@/utils";
import BuyBackService from "@/services/BuyBackService";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";

export default function TableHistories({
  title,
  onHandleSetCurrentPage,
  pagination,
  onHandleSetqValue,
  tableData,
  columns,
}) {
  const {t} = useTranslation();
  return (
    <MDBox>
      <MUIDataTable
        title={title}
        className="brMd"
        options={{
          onSearchChange: async q => {
            onHandleSetCurrentPage(1);
            onHandleSetqValue(String(q || "").trim());
          },
          setTableProps: () => {
            return {
              size: "medium",
            };
          },
          elevation: 1,
          serverSide: true,
          print: false,
          onChangePage: current_page => onHandleSetCurrentPage((current_page += 1)),
          rowsPerPage: pagination?.per_page ? pagination?.per_page : 10,
          count: pagination?.total ? pagination?.total : null,
          textLabels,
        }}
        // columns={columns}
        columns={UtilMethods.centerAlignColumns(["status", "actions"])(columns)}
        data={tableData}
      />
    </MDBox>
  );
}
