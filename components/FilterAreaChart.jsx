import Grid from "@mui/material/Grid";
import {Dialog, DialogContent, FormControl, MenuItem, Select, Typography} from "@mui/material";
import DateRangePicker from "@/components/DateRangePicker";
import MultiSelectBox from "@/components/MultiSelectBox";
import React, {useEffect, useState} from "react";
import UtilMethods from "@/utils/UtilMethods";
import {useTranslation} from "react-i18next";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import OutlinedInput from "@mui/material/OutlinedInput";
import moment from "moment";
import Alert from "@mui/material/Alert";

export default function FilterAreaChart({setDateRange, setGranularity, setProviders}) {
  const [granularity, setNewGranularity] = React.useState('MONTHLY');
  const [thisDateRange, setThisDateRange] = React.useState({startDate: null, endDate: null});
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};
  const { t } = useTranslation();
  const [showAlert, setShowAlert] = useState({show: false, message: ''});

  const handleChangeGranularity = (e) => {
    const startDate = moment(thisDateRange.startDate);
    const endDate = moment(thisDateRange.endDate);
    let diffDate;
    switch (e.target.value) {
      case 'DAILY':
        diffDate= endDate.diff(startDate, 'days');
        if(diffDate <= 30){
          setGranularity(e.target.value);
          setNewGranularity(e.target.value);
        } else{
          setShowAlert({show: true, message: t("dailyLimit")});
        }
        break;
      case 'YEARLY':
        diffDate= endDate.diff(startDate, 'years');
        if(thisDateRange.startDate === null || diffDate <= 11){
          setGranularity(e.target.value);
          setNewGranularity(e.target.value);
        } else{
          setShowAlert({show: true, message: t("annualLimit")});
        }
        break;
      case 'MONTHLY':
        diffDate= endDate.diff(startDate, 'months');
        if(thisDateRange.startDate === null || diffDate <= 12){
          setGranularity(e.target.value);
          setNewGranularity(e.target.value);
        } else{
          setShowAlert({show: true, message: t("monthlyLimit")});
        }
        break;
    }
  }

  return (
    <Grid sx={{display: 'flex', flexDirection: {xs:'Column', md:'row'}, justifyContent:'flex-start', pl:2, pt:1, pr:1, width: '100%'}}>
      {
        showAlert.show && (
          <Dialog open={showAlert.show} >
            <DialogContent>
              <Alert severity="warning" onClose={()=>{setShowAlert({show: false, message: ''})}}>{showAlert.message}</Alert>
            </DialogContent>
          </Dialog>
        )
      }
      <Grid sx={{minWidth:'180px'}}>
        <Typography sx={{fontSize: '0.925rem'}}>{t('dateRange')}</Typography>
        <DateRangePicker
          label={t('pickDate')}
          onChange={(val)=>{setDateRange(val);setThisDateRange(val);}}
          granularity={granularity}
        />
      </Grid>
      <Grid sx={{ml:{md:2}, mt:{md:0, xs:1}, minWidth:'180px'}}>
        <Typography sx={{fontSize: '0.925rem'}}>{t('granularity')}</Typography>
        <FormControl fullWidth>
          <Select
            defaultValue="MONTHLY"
            value={granularity}
            onChange={(e)=>{handleChangeGranularity(e)}}
            sx={{height: 35}}
            variant='outlined'
            input={
              <OutlinedInput endAdornment={
                <ArrowDropDownIcon sx={{pointerEvents: 'none', ml:1, color: '#00000099'}}/>
              }/>
            }
          >
            <MenuItem value='DAILY'>{t('daily')}</MenuItem>
            <MenuItem value='MONTHLY'>{t('monthly')}</MenuItem>
            <MenuItem value='YEARLY'>{t('yearly')}</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      {
        UtilMethods.getHabilitations(authorizations, 'provider').canRead &&
        <Grid sx={{ml:{md:2}, mt:{md:0, xs:1}, flexGrow:1}}>
          <Typography sx={{fontSize: '0.925rem'}}>{t('providers')}</Typography>
          <MultiSelectBox label={t('providers')} onSelect={(data)=>{setProviders(data)}}/>
        </Grid>
      }
    </Grid>
  );
}