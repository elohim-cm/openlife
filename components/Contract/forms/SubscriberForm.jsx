import React, {useRef, useState, forwardRef, useImperativeHandle, useEffect, useCallback} from "react";
import {zodResolver} from "@hookform/resolvers/zod";
import subscriberSchema from "@/components/Contract/schemas/subscriberSchema";
import {Controller, useForm} from "react-hook-form";
import Grid from "@mui/material/Unstable_Grid2";
import {
  Button,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  TextField,
} from "@mui/material";
import Autocomplete from "@mui/material/Autocomplete";
import {DevTool} from "@hookform/devtools";
import {useTranslation} from "react-i18next";

const SubscriberForm = ({maritalStatuses, genders, subscriberInfo, getFormData}, ref) => {
  const {t} = useTranslation();
  const [subscriberFormData, setSubscriberFormData] = useState({});
  const formRef = useRef(null);

  useEffect(() => {
    getFormData(subscriberInfo);
  }, [getFormData, subscriberFormData]);

  useImperativeHandle(
    ref,
    () => ({
      getFormValues: () => {
        if (formRef.current) {
          formRef.current.click();
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
    resolver: zodResolver(subscriberSchema),
    defaultValues: subscriberInfo,
    mode: "all",
  });

  const onSubmit = e => {
    setSubscriberFormData(getValues());
    getFormData(getValues());
  };

  return (
    <>
      <Paper component="form" elevation={0}>
        <Grid container spacing={4} sx={{mt: 3}}>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="first_name"
              variant="filled"
              label={t("lastName")}
              disabled={true}
              fullWidth
              {...register("last_name")}
              error={!!errors.last_name}
              helperText={errors.last_name?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="first_name"
              variant="filled"
              label={t("firstName")}
              disabled={true}
              fullWidth
              {...register("first_name")}
              error={!!errors.first_name}
              helperText={errors.first_name?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="email"
              variant="filled"
              label={t("emailAddress")}
              disabled={true}
              fullWidth
              {...register("email")}
              error={!!errors.email}
              helperText={errors.email?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="main_phone"
              variant="filled"
              label={t("primaryPhoneNumber")}
              disabled={true}
              fullWidth
              {...register("main_phone")}
              error={!!errors.main_phone}
              helperText={errors.main_phone?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="secondary_phone"
              variant="filled"
              label={t("secondaryPhoneNumber")}
              disabled={true}
              fullWidth
              {...register("secondary_phone")}
              error={!!errors.secondary_phone}
              helperText={errors.secondary_phone?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="birth_date"
              variant="filled"
              label={t("dateOfBirth")}
              disabled={true}
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
              disabled={true}
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
              disabled={true}
              fullWidth
              {...register("address")}
              error={!!errors.address}
              helperText={errors.address?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="niu_number"
              variant="filled"
              label={t("uniqueIdentifierNumber")}
              disabled={true}
              fullWidth
              {...register("niu_number")}
              error={!!errors.niu_number}
              helperText={errors.niu_number?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="cni_number"
              variant="filled"
              label={t("nationalIDNumber")}
              disabled={true}
              fullWidth
              {...register("cni_number")}
              error={!!errors.cni_number}
              helperText={errors.cni_number?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <TextField
              id="cni_expired_date"
              variant="filled"
              label={t("nationalIDExpirationDate")}
              type="date"
              disabled={true}
              fullWidth
              {...register("cni_expired_date")}
              error={!!errors.cni_expired_date}
              helperText={errors.cni_expired_date?.message}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <Controller
              name="marital_status"
              control={control}
              render={({field: {onChange, value}}) => (
                <Autocomplete
                  id="marital_status"
                  onChange={(_, item) => {
                    onChange(item);
                  }}
                  value={value}
                  options={maritalStatuses}
                  isOptionEqualToValue={(option, value) => option.uid === value.uid}
                  fullWidth
                  disabled={true}
                  renderInput={params => (
                    <TextField
                      {...params}
                      label={t("maritalStatus")}
                      variant="filled"
                      helperText={errors.marital_status?.message}
                      error={!!errors.marital_status}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid xs={12} md={6} lg={4} xl={4}>
            <FormControl component="fieldset">
              <FormLabel id="gender">{t("gender")}</FormLabel>
              <Controller
                name="gender"
                control={control}
                disabled={true}
                rules={{
                  validate: value => schema.parse(value).success || `${t("YouMustSelectAGender")}`,
                }}
                render={({field: {onChange, value}}) => (
                  <RadioGroup row aria-labelledby="gender" value={value} onChange={e => onChange(e.target.value)}>
                    {genders.map(gender => {
                      return (
                        <FormControlLabel
                          key={gender.uid}
                          value={gender.uid}
                          control={<Radio />}
                          label={gender.label}
                        />
                      );
                    })}
                  </RadioGroup>
                )}
              />
              {errors.sexe && <FormHelperText error>{errors.sexe.message}</FormHelperText>}
            </FormControl>
          </Grid>
          <Button
            id="subscriberFormSubmit"
            variant="contained"
            ref={formRef}
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
export default forwardRef(SubscriberForm);
