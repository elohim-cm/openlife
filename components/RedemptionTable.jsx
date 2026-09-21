import React, {useEffect, useRef, useState} from 'react'
import {Box, Button, Stack, Tooltip} from "@mui/material";
import MUIDataTable from "mui-datatables";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import {useTranslation} from "react-i18next";

export default function RedemptionTable({
    buybacks,
    columns,
    tableTitle,
    tableUtils,
    context,
    downloadRef,
    pagination,
    setBuybacks,
    getBuybacks,
    tableData,
    ready,
    actionButtonLabels,
    handleActiveFilter,
    activeButtonIndex
}) {
    const {t} = useTranslation();
    return (
        <>
            <Box sx={{mt: 2, mb: 2}}>
                <div className="__flex-row">
                    <Stack direction="row" spacing={4} className="action-buttons-container">
                        <Box className="status-filter-button-group">
                            {actionButtonLabels.map(actionButton => {
                                return (
                                    <Button
                                        className={`status-filter-button ${activeButtonIndex === actionButton.id ? "active" : ""}`}
                                        variant="contained"
                                        disabled={!ready || activeButtonIndex === actionButton.id}
                                        onClick={() => handleActiveFilter(actionButton.id, actionButton.status)}
                                        key={actionButton.id}>
                                        {actionButton.label}
                                    </Button>
                                );
                            })}
                        </Box>
                    </Stack>
                </div>
            </Box>
            <MUIDataTable
                title={tableTitle}
                className="brMd"
                options={{
                    setTableProps: () => {
                        return {
                            size: "medium",
                        };
                    },
                    /*onDownload: () => {
                        const fn = async () => {
                            if (tableUtils.isRowsSelected()) {
                                context.togglePageLoading(true);
                                await tableUtils.handleDownload(columns, tableData, true, BuyBackService.getAll);
                                context.togglePageLoading(false);
                            } else {
                                downloadRef.current?.open();
                            }
                        };
                        fn();
                        return false;
                    },*/
                    isRowSelectable: false,
                    elevation: 1,
                    serverSide: true,
                    print: false,
                    rowsPerPage: pagination.per_page ? pagination.per_page : 10,
                    count: pagination.total ? pagination.total : null,
                    textLabels: textLabels,
                    onTableChange: async (action, tableState) => {
                        await tableUtils.onTableChange(
                            action,
                            tableState,
                            setBuybacks,
                            _search => {
                                getBuybacks(1, _search, undefined);
                            },
                            context.togglePageLoading,
                            getBuybacks,
                            tableData,
                            "buybacks",
                        );
                    },
                }}
                columns={columns}
                // columns={UtilMethods.centerAlignColumns(["code", "amount", "status", "actions"])(columns)}
                data={tableData(buybacks)}
                style={{"& thead": {fontWeight: "bold"}}}
            />
        </>
    )
}
