import React, {forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import PersonSchema from "@/components/Contract/schemas/PersonSchema";
import {Controller, useForm} from "react-hook-form";
import Grid from "@mui/material/Unstable_Grid2";
import {Button, Paper, TextField} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import {useTranslation} from "react-i18next";

const PersonContactForm = ({affiliations, personContactInfo, getFormData}, ref) => {
  const {t} = useTranslation();
  const [personContactFormData, setPersonContactFormData] = useState({});
  const submitButtonRef = useRef(null);

  useEffect(() => {
    getFormData(personContactInfo);
  }, [getFormData, personContactFormData]);

  useImperativeHandle(
    ref,
    () => ({
      getFormValues: () => {
        if (submitButtonRef.current) {
          submitButtonRef.current.click();
        }
      },
    }),
    [],
  );

  // validation schema
  const {
    register,
    formState: {errors, isSubmitting},
    getValues,
    control,
  } = useForm({
    resolver: zodResolver(PersonSchema),
    defaultValues: personContactInfo,
    mode: "all",
  });

  const onSubmit = e => {
    setPersonContactFormData(getValues());
    getFormData(getValues());
  };

  return (
    <>
      <Paper component="form" elevation={0}>
        <Grid container spacing={4} sx={{mt: 3}}>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <Controller
              name="affiliations"
              control={control}
              render={({field: {onChange, value}}) => (
                <Autocomplete
                  id="marital_status"
                  onChange={(_, item) => {
                    onChange(item);
                  }}
                  value={value}
                  options={affiliations}
                  isOptionEqualToValue={(option, value) => option.uid === value.uid}
                  fullWidth
                  disabled={isSubmitting}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("affiliations")}
                      variant="filled"
                      helperText={errors.affiliation?.message}
                      error={!!errors.affiliation}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="first_name"
              variant="filled"
              label={t("lastName")}
              disabled={isSubmitting}
              fullWidth
              {...register("first_name")}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="last_name"
              variant="filled"
              label={t("firstName")}
              disabled={isSubmitting}
              fullWidth
              {...register("last_name")}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="email"
              variant="filled"
              label={t("emailAddress")}
              disabled={isSubmitting}
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="phone"
              variant="filled"
              label={t("phoneNumber")}
              disabled={isSubmitting}
              fullWidth
              {...register("phone")}
              error={!!errors.phone}
              helperText={errors.phone?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="birth_date"
              variant="filled"
              label={t("dateOfBirth")}
              disabled={isSubmitting}
              type="date"
              fullWidth
              {...register("birth_date")}
              error={!!errors.birth_date}
              helperText={errors.birth_date?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="birth_place"
              variant="filled"
              label={t("placeOfBirth")}
              disabled={isSubmitting}
              fullWidth
              {...register("birth_place")}
              error={!!errors.birth_place}
              helperText={errors.birth_place?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="address"
              variant="filled"
              label={t("address")}
              disabled={isSubmitting}
              fullWidth
              {...register("address")}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Grid>
          <Button
            id="subscriberFormSubmit"
            variant="contained"
            ref={submitButtonRef}
            sx={{
              visibility: "hidden",
              position: "absolute",
              bottom: 0,
              right: 0,
              zIndex: "-1",
            }}
            onClick={onSubmit}></Button>
          <DevTool control={control} placement="top-right" />
        </Grid>
      </Paper>
    </>
  );
};
export default forwardRef(PersonContactForm);
