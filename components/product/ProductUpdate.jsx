'use client'

import React, {useCallback, useEffect, useRef, useState} from "react";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Box, Button, Grid, Paper, Stack, Step, StepButton, StepIcon, StepLabel, Stepper, TextField, Typography} from "@mui/material";
import {useForm} from "react-hook-form";
import {getToken, getUid} from "@/utils";
import Toast from "@/utils/toast";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CreateFormSkeleton from "@/components/skeletons/CreateFormSkeleton";
import toast from "@/utils/toast";
import {useTranslation} from "react-i18next";
import ProductService from "@/services/ProductService";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from "zod";
import {useRouter} from "next/navigation";
import { displayHttpError } from "@/utils/api";
import { AppContext, useAppContext } from "@/contexts/appContext";
import { DevTool } from "@hookform/devtools";




const ProductUpdate = () => {
  const {t} = useTranslation();
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const token = getToken()
  const router = useRouter();
  const ctx = useAppContext();
  const [formData, setFormData] = useState({
    label: "",
    min_premium: "",
    max_premium: "",
    max_contract: "",
    max_collection_monthly: ""
  });
  
  // get all networks
  const getRecord = useCallback(
    async () => {
      const {error, product} = await ProductService.show(token, getUid());

      if (!error) {
        setProduct(product);
        setFormData({
          label: product.label || "",
          min_premium: product.min_premium || "",
          max_premium: product.max_premium || "",
          max_contract: product.max_contract || "",
          max_collection_monthly: product.max_collection_monthly || ""
        });
      } else {
        displayHttpError(error, router);
      }
    },
    [token, router],
  );

  useEffect(() => {
    getRecord();
  }, [getRecord]);


    // Fonction pour gérer le changement de saisie dans les champs de formulaire
    const handleInputChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
    };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const {error, message} = await ProductService.update(token, getUid(), formData);
      console.log("Form data:", formData);
      if (!error) {
        Toast.success(message, 5000)
        ctx.togglePageLoading(true)
        router.back()
      } else {
        displayHttpError(error, router);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {product === null ? (
        <CreateFormSkeleton />
      ) : (
        <>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            color="secondary"
            onClick={e => {
              context.togglePageLoading(true);
              router.back();
            }}
            sx={{mb: 2}}>
            {t("back")}
          </Button>
          <Paper elevation={2} sx={{padding: "40px 24px", mb: 3, position: "relative"}} className="brSm">
            <ActivityIndicator visible={isLoading} />
            <Typography variant="h5" component="h5" mb={2}>
              {t("updateProduct")}
            </Typography>
            <ActivityIndicator visible={isLoading} />
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4} style={{ width: "100%", margin: "18px auto" }}>
                <Grid item xs={12} md={6} lg={6} xl={4}>
                  <TextField
                    variant="filled"
                    id="label"
                    label={t('label')}
                    fullWidth
                    name="label"
                    value={formData.label}
                    onChange={handleInputChange}
                    disabled={true}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={6} xl={4}>
                  <Stack direction="row" spacing={1}>
                    <Box>
                      <TextField
                        variant="filled"
                        id="min_premium"
                        label={t('min_premium')}
                        name="min_premium"
                        value={formData.min_premium}
                        onChange={handleInputChange}
                        fullWidth
                        disabled={true}
                      />
                    </Box>
                    <Box >
                      <TextField
                        variant="filled"
                        id="max_premium"
                        label={t('max_premium')}
                        fullWidth
                        name="max_premium"
                        value={formData.max_premium}
                        onChange={handleInputChange}
                        disabled={true}
                      />
                    </Box>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6} lg={4} xl={4}>
                  <TextField
                    id="max_contract"
                    variant="filled"
                    label={t('max_contract')}
                    type="text"
                    fullWidth
                    name="max_contract"
                    value={formData.max_contract}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item xs={12} md={6} lg={6} xl={4}>
                  <TextField
                    variant="filled"
                    id="max_collection_monthly"
                    label={t('max_collection_monthly')}
                    type="text"
                    fullWidth
                    name="max_collection_monthly"
                    value={formData.max_collection_monthly}
                    onChange={handleInputChange}
                  />
                </Grid>
                <Grid item container xs={12} md={6} lg={12} xl={12}>
                  <Grid xs={12} md={12} lg={2} xl={2}>
                    <Button
                      type="submit"
                      variant="contained"
                      size="large"
                      sx={{ mt: 1 }}
                      className="brSm"
                      disabled={isLoading}
                    >
                      {t('update')}
                    </Button>
                  </Grid>
                </Grid>
              </Grid>
            </form>
          </Paper>
        </>
      )}
    </>
  );
};

export default ProductUpdate;
