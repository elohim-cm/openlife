"use client";

import React from "react";
import {useTranslation} from "react-i18next";
import {Button, ClickAwayListener, Paper, Popper, Typography} from "@mui/material";
import MDBox from "@/material/components/MDBox";
import CircularProgress from "@mui/material/CircularProgress";
import MDTypography from "@/material/components/MDTypography";
import {ACCESS_CREATE_PAGE, NOTIFICATION_LISTING} from "@/utils/routes/routes";
import {useRouter} from "next/navigation";
import {useAppContext} from "@/contexts/appContext";

const NotificationWrapper = ({cNotif, onHandleClickItem, notifications, open, anchorRef, toggleOpen, onHandleMarkAsRead, timeDifference, iconRetrieved}) => {
    const {t} = useTranslation();
    const router = useRouter();
    const context = useAppContext();

    return (
        <div>
            <Popper
                open={open}
                anchorEl={anchorRef.current}
                placement="top-end" // Position the popper at the top end of the icon
                transition
                disablePortal
                style={{
                    position: 'fixed',
                    top: '80px',
                    left: 'auto',
                    right: '200px',
                    zIndex: 9999,
                    width: '450px',
                    borderRadius: '10px'
                }} // Ensure the Popper is above all other elements
            >
                {({ TransitionProps }) => (
                    <ClickAwayListener onClickAway={toggleOpen}>
                        <Paper style={{borderRadius: '12px'}}>
                            <div style={{ padding: '1.25rem', width: '100%' }}>
                                <MDBox style={{
                                    borderBottom: '1px solid #d5d5d5',
                                    padding: '8px',
                                    fontSize: "12px",
                                    marginBottom: "12px"
                                }}>NOTIFICATIONS {' '} ({cNotif})</MDBox>
                                {notifications === undefined?
                                    <div style={{
                                        display:'flex',
                                        alignItems:'center',
                                        justifyContent:'center'
                                    }}>
                                        <CircularProgress />
                                    </div>
                                    : notifications?.slice(0, 3).map((notification, index) => {
                                        if(notification.status === 'read')
                                            return  null

                                        return (<div onClick={() => {
                                            toggleOpen()
                                            onHandleClickItem(notification, index)
                                        }} key={notification.uid} style={{
                                            marginBottom: '10px',
                                            border: '1px solid #d5d5d5',
                                            borderRadius: '10px',
                                            padding: "10px",
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            cursor: 'pointer',
                                            maxHeight: "70px",
                                            overflowY: "auto"
                                        }}
                                        >
                                            <MDBox style={{
                                                display: 'flex',
                                                alignItems: 'center'
                                            }}>
                                                {iconRetrieved[notification.type].icon}
                                                <MDBox style={{marginLeft: '8px'}}>
                                                    <MDTypography style={{
                                                        fontSize: "12px",
                                                        fontWeight: "bolder",
                                                        color: `${iconRetrieved[notification.type].color}`
                                                    }}>
                                                        <span>{notification.title}</span>
                                                    </MDTypography>
                                                    {getDecription(notification.datas)}
                                                    <MDTypography style={{fontSize: "10px", marginTop:"4px", opacity:".5", fontWeight: "light"}}>{t('thereIs')} {timeDifference(notification.created_at)}</MDTypography>
                                                </MDBox>
                                            </MDBox>
                                            {notification.status === 'unread' && <Button
                                                onClick={() => onHandleMarkAsRead(notification.uid)}
                                                variant="contained"
                                                color="dark"
                                                size="small"
                                                style={{
                                                    borderRadius: '8px',
                                                    textTransform: 'initial',
                                                    padding: '8px 12px',
                                                    color: "white",
                                                    fontSize: "9px"
                                                }}
                                            >
                                                {t('markAsRead')}
                                            </Button>}
                                        </div>)
                                    })}
                                {notifications?.length >0 && <div style={{textAlign: 'right', marginTop: '10px'}}>
                                    <Typography
                                        color="primary"
                                        variant="subtitle2"
                                        onClick={
                                            ()=>{
                                                toggleOpen()
                                                context.togglePageLoading(true);
                                                router.push(NOTIFICATION_LISTING);
                                            }
                                        }
                                        style={{
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            fontSize: "12px"
                                        }}

                                    >
                                        {t('viewMore')}
                                    </Typography>
                                </div>}
                            </div>
                        </Paper>
                    </ClickAwayListener>
                )}
            </Popper>
        </div>
    );
};

const getDecription = (_datas) => {
    const datas = _datas ?? {}

    if (Object.keys(datas).includes('message')){
        return <MDTypography style={{fontSize:'10px'}}>{datas['message']}</MDTypography>
    }

    return null
}
export default NotificationWrapper;
