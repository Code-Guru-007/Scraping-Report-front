import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import {
    Box,
    Table,
    TableCell,
    TableBody,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TableSortLabel,
    Toolbar,
    Typography,
    Paper,
    Button,
    Tooltip
} from '@mui/material';
import { DemoContainer } from '@mui/x-date-pickers/internals/demo';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { visuallyHidden } from '@mui/utils';


function descendingComparator(a, b, orderBy) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

const headCells = [
    {
        id: 'id',
        numeric: true,
        disablePadding: false,
        label: 'No',
        sortable: false
    },
    {
        id: 'dateTime',
        numeric: true,
        disablePadding: false,
        label: 'Date and  Time',
        sortable: true
    },
    {
        id: 'status',
        numeric: true,
        disablePadding: false,
        label: 'Scrape Status',
        sortable: true
    },
    {
        id: 'fileName',
        numeric: true,
        disablePadding: false,
        label: 'File Name',
        sortable: true
    },
    {
        id: 'fileLink',
        numeric: true,
        disablePadding: false,
        label: 'Action',
        sortable: false
    },
];


function EnhancedTableHead(props) {
    const { order, orderBy, onRequestSort } =
        props;
    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    };

    return (
        <TableHead>
            <TableRow>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        padding={headCell.disablePadding ? 'none' : 'normal'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        {headCell.sortable ? (<TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>) : (<>{headCell.label}</>)}
                        
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}

EnhancedTableHead.propTypes = {
    numSelected: PropTypes.number.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    onSelectAllClick: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number.isRequired,
};

export default function ReportTable(props) {
    const { rows, page, category, setFilterDate, setPage} = props;
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('dateTime');

    // Load page number from localStorage
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const navigate = useNavigate();




    const viewPdf = (row) => {
        navigate(`/pdf/${row.fileName.split('.')[0]}`, { 
            state: { 
                fileLink: `http://188.245.216.211/public/download/${category.type}/${row.fileLink}`,
            } 
        });
    };

    useEffect(() => {
        localStorage.setItem("pageNumber", page); // Store page number
    }, [page]);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
        localStorage.setItem("pageNumber", newPage); // Save new page number
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
        localStorage.setItem("pageNumber", 0); // Reset to first page when changing rows per page
    };

    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

    const visibleRows = useMemo(
        () =>
            [...rows]
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage),
        [rows, order, orderBy, page, rowsPerPage],
    );

    return (
        <Paper sx={{ p: 4 }}>
            <Toolbar
                sx={{
                    pl: { sm: 2 },
                    pr: { xs: 1, sm: 1 },
                    display: 'flex',
                    justifyContent: 'space-between'
                }}
            >
                <Typography variant="h5" id="tableTitle" component="div">
                    {category.title}
                </Typography>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DemoContainer components={['DatePicker']}>
                        <DatePicker 
                            onChange={(newValue) => setFilterDate(newValue)}
                            label="Date Filter" 
                            slotProps={{field: {clearable: true}}}
                        />
                    </DemoContainer>
                </LocalizationProvider>
            </Toolbar>
            <TableContainer>
                <Table sx={{ minWidth: 750 }} aria-labelledby="tableTitle" size="medium">
                    <EnhancedTableHead
                        order={order}
                        orderBy={orderBy}
                        onRequestSort={handleRequestSort}
                        rowCount={rows.length}
                    />
                    <TableBody>
                        {visibleRows.map((row, index) => (
                            <TableRow hover role="checkbox" tabIndex={-1} key={index} sx={{ cursor: 'pointer' }}>
                                <TableCell align="right">{rows.length - page * rowsPerPage - index}</TableCell>
                                <TableCell align="right">{new Date(row.dateTime).toLocaleString()}</TableCell>
                                <TableCell align="right">{row.status ? "Yes" : "No"}</TableCell>
                                <TableCell align="right">{row.fileName}</TableCell>
                                <TableCell align="right">
                                    <Tooltip title={`DB-Legale-doc/${category.type}/downloaded/${row.fileLink}`}>
                                        <Button variant="outlined" onClick={() => viewPdf(row)}>
                                            View PDF
                                        </Button>
                                    </Tooltip>
                                </TableCell>
                            </TableRow>
                        ))}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={6} />
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 100, 500, 1000]}
                component="div"
                count={rows.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Paper>
    );
}
