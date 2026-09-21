import React, {useCallback, useEffect, useState} from "react";
import TableSkeleton from "@/components/skeletons/TableSkeleton";
import {useRouter} from "next/navigation";
import Toast from "@/utils/toast";
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
import styles from "@/styles/accountListing.module.scss";
import DeleteIcon from "@mui/icons-material/Delete";
import MUIDataTable from "mui-datatables";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import textLabels from "@/utils/mui-data-tables/mui-data-tables-text-labels";
import {useAppContext} from "@/contexts/appContext";
import {getStatusBadge} from "@/utils";
import TableUtils from "@/utils/table";
import {MarkChatReadSharp, Visibility} from "@mui/icons-material";
import Tooltip from "@mui/material/Tooltip";
import {useTranslation} from "react-i18next";
import NotificationService from "@/services/Notification";
import AuthService from "@/services/AuthService";
import moment from "moment";
import {
    BUYBACK_SHOW,
    COMMISSION_READ,
    CONTRACT_SHOW,
    DASHBOARD_PAGE,
    NOTIFICATION_LISTING,
    PROVIDER_READ
} from "@/utils/routes/routes";
import Routes from "@/utils/routes";
import EditIcon from "@mui/icons-material/Edit";

const tableUtils = new TableUtils();
const NotificationListing = () => {
    const {t} = useTranslation();
    const [notifications, setNotifications] = useState(undefined);
    const [inProgress, setInProgress] = useState(false);
    const [deleteModal, setDeleteModal] = useState(false);
    const [uidNotif, setuidNotif] = useState('');
    const [openDetailModal, setOpenDetailModal] = useState(false);
    const [pagination, setPagination] = useState(undefined);
    const [currentPage, setCurrentPage] = useState(1);
    const router = useRouter();
    const context = useAppContext();
    const [tableTitle, setTableTitle] = useState(t("allNotifications"));
    const [ready, setReady] = useState(false);
    const [activeButtonIndex, setActiveButtonIndex] = useState(1);
    const [statut, setStatut] = useState("");
    const [perPage, setPerPage] = useState(10);

    //  token
    const {token, authorizations, currentAccess, uid} = JSON.parse(localStorage.getItem("storedValues")) || {};

    const columns = [
        {name: "uid", label: "uid", options: {display: "excluded"}},
        {name: "title", label: t("title")},
        {name: "type", label: t("type")},
        {
            name: "status",
            label: t("status"),
        },
        {name: "item", label: t("item")},
        {name: "message", label: t("message")},
        {name: "read_at", label: t("read_at")},
        {name: "created_at", label: t("createdOn")},
        {name: "actions", label: t("actions"), options: {filter: false, sort: false}, unexport: true},
    ];

    const getNotifications = useCallback(
        async (_page, _uid, _statut, _perPage=10) => {
            try {
                setReady(false);
                const {notifications, pagination} = await NotificationService.get(token, _page, _uid, _statut, _perPage);

                setNotifications(notifications);
                setPagination(pagination);
                setCurrentPage(pagination?.current_page);
                tableUtils.setRecord(notifications);
                setReady(true);
            }catch (e) {
                AuthService.formatFetchErrorMsgAndLogout(e, context, router)
            }
        },
        [token, router],
    );
    //  get notifications
    useEffect(() => {
        getNotifications(currentPage, uid, statut, perPage);
    }, [getNotifications, currentPage, uid, statut, perPage]);

    const handleMaskAsRead = async (_uid) => {
        try {
            const { message, data } = await NotificationService.maskAsRead(token, _uid);
            const updatedNotifications = [...notifications];
            const notificationIndex = updatedNotifications.findIndex(notif => notif.uid === _uid);

            if (notificationIndex !== -1) {
                updatedNotifications[notificationIndex] = data;
                setNotifications(updatedNotifications);
                Toast.success(message);
            } else {
                Toast.error("Notification not found.");
            }
        } catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e, context, router);
        }
    };

    const handleOpenModal = (_uid) =>{
        setDeleteModal(true)
        setOpenDetailModal(true)
        setuidNotif(_uid)
    }

    const handleDelete = async ()=>{
        try {
            const { message } = await NotificationService.delete(token, uidNotif);

            const updatedNotifications = notifications.filter(notif => notif.uid !== uidNotif);
            setDeleteModal(false)
            setOpenDetailModal(false)
            setNotifications(updatedNotifications);
            Toast.success(message);
        } catch (e) {
            AuthService.formatFetchErrorMsgAndLogout(e, context, router);
        }
    }
    let tableData = records => {
        return notifications?.map(notification => {
            const datas =  notification?.datas || {};

            return ({
                uid: datas[Object.keys(datas)[0]],
                title: notification.title,
                type: notification.type,
                status: getStatusBadge(notification.status, t),
                item: Object.keys(datas)[0],
                message: datas[Object.keys(datas)[1]],
                read_at: notification.read_at,
                created_at: moment(notification.created_at).format("YYYY-MM-DD HH:mm:ss"),
                actions: (
                    <Stack direction="row" spacing={1}>
                        <Visibility
                            color="primary"
                            onClick={() => handleRowClick(datas)}
                            className={styles.clickableIcon}
                        />
                        {notification.status === 'unread' && <Tooltip title={t("maskAsRead")} placement="bottom">
                            <MarkChatReadSharp
                                onClick={() => handleMaskAsRead(notification.uid)}
                                color="info"
                                className={styles.clickableIcon}
                            />
                        </Tooltip>}
                        <DeleteIcon
                            onClick={() => handleOpenModal(notification.uid)}
                            color="error"
                            className={styles.clickableIcon}
                        />
                    </Stack>
                ),
            })
        });
    };
    const actionButtonLabels = [
        {id: 1, label: t("all"), status: "", tableTitle: t("allNotifications")},
        {
            id: 2,
            label: NotificationService.equivalent(t).read,
            status: NotificationService.READ,
            tableTitle: t("readNotifications"),
        },
        {id: 3, label: NotificationService.equivalent(t).unread, status: NotificationService.UNREAD, tableTitle: t("unreadNotifications")},
    ];

    const handleActiveFilter = (index, status) => {
        // focus active filter
        setActiveButtonIndex(index);
        setStatut(status);

        if (status !== "") {
            setTableTitle(actionButtonLabels.find(actionButton => actionButton.id === index).tableTitle);
        } else {
            setTableTitle(t("allNotifications"));
        }
    };

    const handleRowClick = (datas) => {
        const uid = datas[Object.keys(datas)[0]], item = Object.keys(datas)[0]
        checkerItem(uid, item, router, Routes, context)
    }

    return (
        <>
            {notifications === undefined ? (
                <TableSkeleton rowsNumber={8} />
            ) : (
                <>
                    <Box sx={{mt: 2, mb: 2}}>
                        <div className="__flex-row">
                            <Stack
                                direction="row"
                                width="100%"
                                display="flex"
                                justifyContent="space-between"
                                alignItems="center"
                                spacing={4}
                                className="action-buttons-container">
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
                        // title={t("accessList")}
                        title={tableTitle}
                        className="brMd"
                        options={{
                            setTableProps: () => {
                                return {
                                    size: "medium",
                                };
                            },
                            elevation: 1,
                            serverSide: true,
                            onSearchChange: async q => {
                                setCurrentPage(1);
                                setqNotif(String(q || "").trim());
                            },
                            onChangeRowsPerPage: async _perPage => setPerPage(_perPage),
                            rowsPerPageOptions: [10, 20, 50, 100, 200],
                            onChangePage: async currPage => setCurrentPage(currPage + 1),
                            onTableChange: async (action, tableState) => {
                                await tableUtils.onTableChange(
                                    action,
                                    tableState,
                                    setNotifications,
                                    _search => {
                                        getNotifications(1, _search, undefined);
                                    },
                                    context.togglePageLoading,
                                    getNotifications,
                                    tableData,
                                    "notification",
                                );
                            },
                            rowsPerPage: pagination.per_page ? pagination.per_page : 10,
                            count: pagination.total ? pagination.total : null,
                            textLabels: textLabels,
                            // onRowClick: (rowData, rowMeta) => handleRowClick(rowData, rowMeta),
                        }}
                        columns={columns}
                        data={tableData(notifications)}
                    />
                    <Dialog
                        open={openDetailModal}
                        onClose={() => setOpenDetailModal(false)}
                        aria-labelledby="alert-delete-access"
                        aria-describedby="confirm-delete-access">
                        <DialogTitle id="alert-dialog-title">
                            <Stack color="warning" direction="rows" alignItems="center">
                                <WarningAmberIcon color="error" fontSize="medium" sx={{mr: 1}} />
                                <Typography variant="h4" component="p" color="error.main">
                                    {t("warning")}
                                </Typography>
                            </Stack>
                        </DialogTitle>
                        <DialogContent>
                            <DialogContentText id="alert-dialog-description">
                                {t("areYouSureYouWantToDeleteThisItem")}
                            </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                            <Button variant="outlined" onClick={() => setOpenDetailModal(false)}>
                                {t("cancel")}
                            </Button>
                            <Button variant="contained" onClick={handleDelete} color="error">
                                {t("delete")}
                            </Button>
                        </DialogActions>
                    </Dialog>
                    {/*{deleteModal && access && (
                        <AlertDialog title={t("accessDetail")} datas={access} open={deleteModal} onOpenAlert={setDeleteModal} />
                    )}*/}
                </>
            )}
        </>
    );
};

export const checkerItem = (_uid, _item, _router, _route, _context) =>{

    _context.togglePageLoading(true);
    switch (_item) {
        case 'provider':
            _router.push(PROVIDER_READ(_uid));
            break
        case 'redemption':
            _router.push(BUYBACK_SHOW(_uid));
            break
        case 'subscription':
            _router.push(_route.SOUSCRIPTION_DETAILS(_uid));
            break
        case 'contract':
            _router.push(_route.CONTRACT_DETAILS(_uid));
            break
        case 'commission':
            _router.push(COMMISSION_READ(_uid));
            break
        case 'access':
            _context.togglePageLoading(false);
            break
        default :
            _router.push(DASHBOARD_PAGE);
            break
    }
}
export default NotificationListing;
