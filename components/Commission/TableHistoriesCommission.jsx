import React, {useState} from 'react'
import MDBox from "@/material/components/MDBox";
import {Stack, Tooltip} from "@mui/material";
import MUIDataTable from "mui-datatables";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import BusinessGoal from "@/services/BusinessGoal";
import ContractService from "@/services/ContractService";
import {formatNumber, getStatusBadge} from "@/utils";
import BuyBackService from "@/services/BuyBackService";
import {useTranslation} from "react-i18next";
import CommissionService from "@/services/CommissionService";

export default function TableHistoriesCommission({histories, onHandleSetCurrentPage, pagination, onHandleSetqValue}) {
    const {t} = useTranslation();
    let tableData = () => {
        return histories?.map(history => ({
            access: `${history?.access?.account?.last_name || ''} ${history?.access?.account?.first_name || ''} (${history?.access?.role?.label})`,
            status: getStatusBadge(history?.status, t),
            comment: history?.comment,
            created_at: history?.created_at,
            updated_at: history?.updated_at
        })) || [];
    };
    return (
        <MDBox>
            <MUIDataTable
                title={t("commissionHistoryListing")}
                className="brMd"
                options={{
                    onSearchChange: async (q) => {
                        onHandleSetCurrentPage(1)
                        onHandleSetqValue(String(q || '').trim())
                    },
                    setTableProps: () => {
                        return {
                            size: "medium",
                        };
                    },
                    elevation: 1,
                    serverSide: true,
                    onChangePage: (current_page) => onHandleSetCurrentPage(current_page += 1),
                    rowsPerPage: pagination?.per_page ? pagination?.per_page : 10,
                    count: pagination?.total ? pagination?.total : null,
                    textLabels,
                }}
                columns={CommissionService.columns(t)}
                data={tableData()}
            />
        </MDBox>
    )
}
