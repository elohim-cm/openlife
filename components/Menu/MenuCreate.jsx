import React, {useState} from "react";
import {useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import createMenuValidationSchema from "@/validations/menus/createMenuValidationSchema";
import {createMenu} from "@/services/memuService";
import Toast from "@/utils/toast";
import {MENU_PAGE} from "@/utils/routes/routes";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import AuthService from "@/services/AuthService";
import {useTranslation} from "react-i18next";

const MenuCreate = () => {
  const [inProgress, setInProgress] = useState(false);
  const [pageLoading, setPageLoading] = useState(false);
  const router = useRouter();
  const context = useAppContext();
  const {t} = useTranslation();
  //  token
  const {token} = JSON.parse(localStorage.getItem("storedValues")) || {};

  //  form hook
  const {
    register,
    formState: {errors},
    handleSubmit,
  } = useForm({resolver: zodResolver(createMenuValidationSchema(t))});

  //  create access
  const onSubmit = async data => {
    //  show create loading indicator
    setInProgress(true);

    //  request create access api
    createMenu(token, data)
      .then(res => {
        Toast.success(res.data.message);

        //  redirect to access listing page
        router.push(MENU_PAGE);

        //  remove the progress indicator
        setInProgress(false);
      })
      .catch(e => {
        AuthService.formatFetchErrorMsgAndLogout(e.response.data.message, context, router);

        //  remove the progress indicator
        setInProgress(false);
      });
  };

  return (
    <>
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
      <Paper
        component="form"
        elevation={2}
        onSubmit={handleSubmit(onSubmit)}
        sx={{padding: "40px 24px", mb: 3}}
        className="brSm">
        <PageLoadingIndicator visible={pageLoading} />
        <ActivityIndicator visible={inProgress} />
        <Typography variant="h5" component="h5" mb={2}>
          {t("createANewMenu")}
        </Typography>
        <Grid container spacing={4}>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <TextField
              variant="filled"
              id="lable"
              label={t("label")}
              fullWidth
              error={!!errors.label}
              helperText={errors.label ? errors.label.message : ""}
              {...register("label")}
            />
          </Grid>
          {/*<Grid xs={12} md={6} lg={6} xl={6}>
            <TextField
              variant="filled"
              id="url"
              label={t("url")}
              fullWidth
              error={!!errors.url}
              helperText={errors.url ? errors.url.message : ""}
              {...register("url")}
            />
          </Grid>*/}
          <Grid xs={12} md={6} lg={6} xl={6}>
            <TextField
              variant="filled"
              id="icon"
              label={t("icon")}
              fullWidth
              error={!!errors.icon}
              helperText={errors.icon ? errors.icon.message : ""}
              {...register("icon")}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <TextField
              variant="filled"
              id="group"
              label={t("group")}
              type="number"
              fullWidth
              error={!!errors.group}
              helperText={errors.group ? errors.group.message : ""}
              {...register("group")}
            />
          </Grid>
          <Grid xs={12} md={6} lg={6} xl={6}>
            <TextField
              variant="filled"
              id="order"
              label={t("order")}
              type="number"
              fullWidth
              error={!!errors.order}
              helperText={errors.order ? errors.order.message : ""}
              {...register("order")}
            />
          </Grid>
          <Grid container xs={12} md={6} lg={12} xl={12}>
            <Grid xs={12} md={12} lg={2} xl={2}>
              <Button type="submit" fullWidth variant="contained" size="large" sx={{mt: 1}} className="brSm">
                {t("create")}
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    </>
  );
};

export default MenuCreate;
