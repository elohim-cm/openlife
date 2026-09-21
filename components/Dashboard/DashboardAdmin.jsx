import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Typography, Grid, Paper } from "@mui/material";
import CollectionIndicators from "@/components/Dashboard/indicators/CollectionIndicators";
import RedemptionIndicators from "@/components/Dashboard/indicators/RedemptionIndicators";
import PaymentIndicators from "@/components/Dashboard/indicators/PaymentIndicators";
import AccountIndicators from "@/components/Dashboard/indicators/AccountIndicators";

const DashboardAdmin = () => {
  const [focusRedemption, setFocusRedemption] = useState(false);
  const [focusCollection, setFocusCollection] = useState(false);
  const [focusPayment, setFocusPayment] = useState(false);
  const { t } = useTranslation();
  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={0} sx={{  mb: 3 }} style={{ backgroundColor: "inherit" }}>
        <Typography variant="body1" color="textSecondary" mb={4}>
          {t('welcome')} {JSON.parse(localStorage.getItem("storedValues")).firstName}
        </Typography>
        
        <Box sx={{ mb: 4 }}>
          <AccountIndicators
            onGotData={() => {
              setFocusCollection(true);
            }}
          />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <CollectionIndicators
            focus={focusCollection}
            onGotData={() => {
              setFocusPayment(true);
            }}
          />
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <PaymentIndicators
            focus={focusPayment}
            onGotData={() => {
              setFocusRedemption(true);
            }}
          />
        </Box>
        
        <Box>
          <RedemptionIndicators 
            focus={focusRedemption} 
            onGotData={() => {}} 
          />
        </Box>
      </Paper>
    </Box>
  );
};

export default DashboardAdmin;