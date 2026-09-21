import React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableContainer from "@mui/material/TableContainer";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {isDefined} from "@/utils";
import {styled, useTheme} from "@mui/material/styles";

const StyledTableRow = styled(TableRow)(({ theme }) => ({
    '&:nth-of-type(odd)': {
        backgroundColor: theme.palette.action.hover,
    },
    // hide last border
    '&:last-child td, &:last-child th': {
        border: 0,
    },
}));

const AppTable = ({
        title = "custom-table",
        columns, data, options,
        tableContainer = Paper,
        elevation = 2,
        styledRow = false,
        sx,
        tableProps = {},
        className = ""
    }) => {
    let  [columnsObj, setColumsObj] = React.useState([]);
    let  [columnHasName, setColumnHasName] = React.useState(true);
    const datas = data ?? [];
    const theme = useTheme();

    const AppTableRow = styledRow ? StyledTableRow : TableRow;

    const initColumns = () => {
        const tab = [];
        for (const column of columns) {
            let obj = {
                name: column.name,
                label: column.label ?? column,
                options: column.options,
            };
            tab.push(obj);
            if(column.name === undefined) setColumnHasName(false);
        }
        console.log("Columns::: ", tab);
        setColumsObj(tab);
    }

    const setRow = (row) => {
        const rows = [];
        if(columnHasName) {
            for (const column of columnsObj) {
                for (const key in row) {
                    if (key === "key") continue;
                    if (key === column.name) {
                        rows.push(row[key]);
                    }
                }
            }
        } else {
            for (const key in row) {
                if (key === "key") continue;
                rows.push(row[key]);
            }
        }
        return rows;
    };

    React.useEffect(() => {
        initColumns();
    }, []);

    return (
        <TableContainer component={ tableContainer } elevation={ elevation } className={`brSm ${className}`.trim()} sx={sx}>
            <Table {...tableProps} aria-label={title}>
                <TableHead sx={ { borderBottom: `2px solid ${ theme.palette.primary.main }!important` } }>
                    <TableRow>
                        {
                            columnsObj.map((column, index) => (
                                <TableCell key={index}>{column.label}</TableCell>
                            ))
                        }
                    </TableRow>
                </TableHead>
                <TableBody>
                    {
                        datas.map((row, index) => (
                            <AppTableRow
                                key={ row.key ?? index }
                                sx={ { '&:last-child td, &:last-child th': { border: 0 } } }>
                                {
                                    setRow(row).map((element, _index) => (
                                        <TableCell key={_index}>{element}</TableCell>
                                    ))
                                }
                            </AppTableRow>
                        ))
                    }
                </TableBody>
            </Table>
        </TableContainer>
    );

};

export default AppTable;
