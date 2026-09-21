"use client";

import {useTheme} from "@mui/material/styles";
import "/styles/helpers.scss";
import Grid from "@mui/material/Unstable_Grid2";
import {Box, Button, CardActions, CardContent, Paper, Stack, Typography} from "@mui/material";
import {useParams, useRouter} from "next/navigation";
import React, {useCallback, useEffect, useState} from "react";
import {useAppContext} from "@/contexts/appContext";
import AccountService from "@/services/Account";
import {canInterprateError, displayHttpError} from "@/utils/api";
import Toast from "@/utils/toast";
import {ACCOUNT_LISTING_PAGE, ACCOUNT_UPDATE_PAGE, CREATE_ACCOUNT_PAGE, LOGIN_PAGE} from "@/utils/routes/routes";
import ProfilSkeleton from "@/components/Profil/ProfilSkeleton";
import PersonIcon from "@mui/icons-material/Person";
import Card from "@mui/material/Card";
import Divider from "@mui/material/Divider";
import moment from "moment/moment";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import {getStatusBadge, getUid} from "@/utils";
import AuthService from "@/services/AuthService";
import {useTranslation} from "react-i18next";
import LogoutIcon from "@mui/icons-material/Logout";
import UtilMethods from "@/utils/UtilMethods";

const AccountDetails = () => {
    const {t} = useTranslation();
  const uuid = getUid();
  const [user, setUser] = useState({});
  const [inProgress, setInProgress] = useState(false);
  const {token} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const context = useAppContext();
  // theme
  const theme = useTheme();
  const router = useRouter();
  // const uuid = location.pathname.split('/').pop();

  const getAccount = useCallback(
    async uuid => {
      setInProgress(true);
      const result = await AccountService.show(token, uuid);
      if (result.error === null) {
        // Toast.success("Compte trouver");
        setUser(result.data);
      } else {
        displayHttpError(result.error, router);
      }
      setInProgress(false);
    },
    [router, token, uuid],
  );

  // get all accounts
  useEffect(() => {
    getAccount(uuid);
  }, [getAccount, token, uuid]);

  const handleDisconnectAccount = async () => {
      try {
          const result = await AuthService.logoutWithToken(token, context, uuid);
          Toast.success(result);
      }catch (e) {
          AuthService.formatFetchErrorMsgAndLogout(e.message, context, router)
      }
  }

  return (
    <>
      <Stack width="100%" direction="row" spacing={2} sx={{mb: 3}}>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          color="secondary"
          onClick={() => {
            context.togglePageLoading(true);
            router.back();
          }}
          sx={{mb: 2}}>
            {t("back")}
        </Button>
      </Stack>
      <Paper elevation={3} sx={{borderRadius: 2, padding: "40px 24px", mb: 4, position: "relative"}}>
        {inProgress && <ProfilSkeleton inProgress={inProgress} />}
        {user && !inProgress && (
          <Grid container spacing={3}>
            <Grid item xs={12} md={3} display="flex" justifyContent="center">
              {user.image ? (
                <img
                  alt="User Image"
                  src={user.image ? user.image : "chemin/par/defaut/pour/image"}
                  width={150}
                  height={150}
                  style={{borderRadius: "50%", objectFit: "cover", objectPosition: "center"}}
                />
              ) : (
                <PersonIcon style={{width: "150px", height: "150px"}} />
              )}
            </Grid>
            <Grid item xs={12} md={9}>
              <Card variant="outlined">
                <Typography variant="h4" mt={2} sx={{textAlign: "center", textTransform: "uppercase"}}>
                  {" "}
                    {t("accountInformation")}:{" "}
                </Typography>
                <Divider />
                <CardContent>
                  <Typography variant="subtitle1">
                    <strong>{t("fullName")}:</strong>{" "}
                    <span style={{fontSize: "14px"}}>
                      {user?.first_name} {user?.last_name}
                    </span>{" "}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("email")}: </strong> <span style={{fontSize: "14px"}}>{user?.email}</span>{" "}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("status")}: </strong> <span style={{fontSize: "14px"}}>{getStatusBadge(user?.status, t)}</span>{" "}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("phone")}: </strong> <span style={{fontSize: "14px"}}>{user?.phone}</span>{" "}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("createdOn")}: </strong>{" "}
                    <span style={{fontSize: "14px"}}>{moment(user.created_at).format("MMMM Do YYYY, h:mm:ss a")}</span>{" "}
                  </Typography>
                  <Typography variant="subtitle1">
                    <strong>{t("updatedOn")}: </strong>{" "}
                    <span style={{fontSize: "14px"}}>{moment(user.updated_at).format("MMMM Do YYYY, h:mm:ss a")}</span>{" "}
                  </Typography>
                </CardContent>
                <CardActions sx={{my: 2, px: "3", width: "100%", display: "flex", justifyContent: "flex-end"}}>
                  <Button
                    variant="contained"
                    startIcon={<EditIcon />}
                    color="primary"
                    onClick={() => {
                      context.togglePageLoading(true);
                      router.push(ACCOUNT_UPDATE_PAGE(uuid));
                    }}
                    sx={{mb: 2}}>
                      {t("updateAccount")}
                  </Button>
                    {!UtilMethods.check({email: user?.email}) && <Button
                        variant="contained"
                        startIcon={<LogoutIcon/>}
                        color="error"
                        onClick={handleDisconnectAccount}
                        sx={{mb: 2}}>
                        {t("disconnectAccount")}
                    </Button>}
                </CardActions>
              </Card>
            </Grid>
          </Grid>
        )}
      </Paper>
    </>
  );
};

export default AccountDetails;
