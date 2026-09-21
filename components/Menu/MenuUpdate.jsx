import React, {useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {Button, Paper, TextField, Typography} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import ActivityIndicator from "@/components/ActivityIndicator";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import createMenuValidationSchema from "@/validations/menus/createMenuValidationSchema";
import {createMenu, getMenu, updateMenu} from "@/services/memuService";
import Toast from "@/utils/toast";
import {MENU_PAGE} from "@/utils/routes/routes";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import {useAppContext} from "@/contexts/appContext";
import AuthService from "@/services/AuthService";
import {nullable, z} from "zod";
import {getUid} from "@/utils";
import {useTranslation} from "react-i18next";

const updateMenuValidationSchema = z.object({
  label: z.string().nullable(),
  url: z.string().nullable(),
  icon: z.string().nullable(),
  group: z
    .string()
    .nullable()
    .refine(value => isValidNumber(value), {
      message: "Le groupe doit etre un nombre.",
    }),
  order: z
    .string()
    .nullable()
    .refine(value => isValidNumber(value), {
      message: "L ordre doit etre un nombre.",
    }),
});

function isValidNumber(value) {
  // Check if the value is a number or a numeric string
  return typeof value === "number" || !isNaN(Number(value));
}

const MenuUpdate = () => {
  const [menu, setMenu] = useState(undefined);
  const [inProgress, setInProgress] = useState(false);
  const router = useRouter();
  //  token
  const {token} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const context = useAppContext();
  const {t} = useTranslation();

  const updateMenuValidationSchema = t => z.object({
    label: z.string().nullable(),
    // url: z.string().nullable(),
    icon: z.string().nullable(),
    group: z
      .string()
      .nullable()
      .refine(value => isValidNumber(value), {
        message: t("groupMustBeNumber"),
      }),
    order: z
      .string()
      .nullable()
      .refine(value => isValidNumber(value), {
        message: t("orderMustBeNumber"),
      }),
  });

  //  get the menu
  useEffect(() => {
    //  request api for menu
    getMenu(token, getUid())
      .then(response => {
        setMenu(response.data.data);
      })
      .catch(e => {
        console.log(e)
        AuthService.formatFetchErrorMsgAndLogout(e.response.data.message, context, router)
      });
  }, [token]);

  //  form hook
  const {
    register,
    formState: {errors},
    handleSubmit,
  } = useForm({resolver: zodResolver(updateMenuValidationSchema(t))});

  //  create access
  const onSubmit = async data => {
    //  show create loading indicator
    setInProgress(true);

    //  request create access api
    updateMenu(token, data, getUid())
      .then(res => {
        Toast.success(res.data.message);
        context.togglePageLoading(true);
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
      {menu === undefined ? (
        <CreateFormSkeleton />
      ) : (
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
            {t('back')}
          </Button>
          <Paper
            component="form"
            elevation={2}
            onSubmit={handleSubmit(onSubmit)}
            sx={{padding: "40px 24px", mb: 3}}
            className="brSm">
            <ActivityIndicator visible={inProgress} />
            <Typography variant="h5" component="h5" mb={2}>
              {t("updateMenu")}
            </Typography>
            <Grid container spacing={4}>
              <Grid xs={12} md={6} lg={6} xl={6}>
                <TextField
                  variant="filled"
                  id="label"
                  label={t("label")}
                  defaultValue={menu.label}
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
                  label="Url"
                  defaultValue={menu.url}
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
                  defaultValue={menu.icon}
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
                  defaultValue={menu.group}
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
                  defaultValue={menu.order}
                  fullWidth
                  error={!!errors.order}
                  helperText={errors.order ? errors.order.message : ""}
                  {...register("order")}
                />
              </Grid>
              <Grid container xs={12} md={6} lg={12} xl={12}>
                <Grid xs={12} md={12} lg={2} xl={2}>
                  <Button type="submit" fullWidth variant="contained" size="large" sx={{mt: 1}} className="brSm">
                    {t("update")}
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Paper>
        </>
      )}
    </>
  );
};

export default MenuUpdate;
