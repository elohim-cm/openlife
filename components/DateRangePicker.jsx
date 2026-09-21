import React, {useEffect, useState} from "react";
import Button from "@mui/material/Button";
import { PickerModal } from "mui-daterange-picker-plus/dist";
import {CalendarIcon} from "@mui/x-date-pickers";
import moment from "moment/moment";
import 'moment/locale/fr';
import 'moment/locale/en-gb';

import {
  startOfWeek as startOfWeek2,
  endOfWeek as endOfWeek2,
  addWeeks,
  startOfMonth as startOfMonth2,
  endOfMonth as endOfMonth2,
  addMonths as addMonths2,
  startOfYear as startOfYear2,
  endOfYear as endOfYear2,
  addYears as addYears2
} from "date-fns";
import {fr, enGB} from "date-fns/locale";
import {useTranslation} from "react-i18next";
import Alert from "@mui/material/Alert";
import {Dialog, DialogContent} from "@mui/material";

export default function DateRangePicker({ label, onChange, granularity }) {
  const {t,i18n } = useTranslation();

  // state + handlers for the Modal
  const [anchorEl, setAnchorEl] = useState(null);
  const [showAlert, setShowAlert] = useState({show: false, message: ''});

  useEffect(() => {
    moment.locale(i18n.language);
  }, [i18n.language]);

  const getDefaultRanges = (date, locale) => [
    {
      label: i18n.language === 'en' ? "This Week" : "Cette semaine",
      startDate: startOfWeek2(date, { locale }),
      endDate: endOfWeek2(date, { locale })
    },
    {
      label: i18n.language === 'en' ? "Last Week" : "Semaine dernière",
      startDate: startOfWeek2(addWeeks(date, -1), { locale }),
      endDate: endOfWeek2(addWeeks(date, -1), { locale })
    },
    {
      label: i18n.language === 'en' ? "Last 7 Days" : "7 derniers jours",
      startDate: addWeeks(date, -1),
      endDate: date
    },
    {
      label: i18n.language === 'en' ? "This Month" : "Ce mois",
      startDate: startOfMonth2(date),
      endDate: endOfMonth2(date)
    },
    {
      label: i18n.language === 'en' ? "Last Month" : "Mois dernier",
      startDate: startOfMonth2(addMonths2(date, -1)),
      endDate: endOfMonth2(addMonths2(date, -1))
    },
    {
      label: i18n.language === 'en' ? "This Year" : "Cette année",
      startDate: startOfYear2(date),
      endDate: endOfYear2(date)
    },
    {
      label: i18n.language === 'en' ? "Last Year" : "Année dernière",
      startDate: startOfYear2(addYears2(date, -1)),
      endDate: endOfYear2(addYears2(date, -1))
    }
  ];

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const defaultEndDate = new Date();
  defaultEndDate.setFullYear(defaultEndDate.getFullYear()-1);

  const [initDateRange, setInitDateRange] = useState({
    startDate: defaultEndDate,
    endDate: new Date(),
  })
  // state + handlers for the DateRange Value
  const [date, setDate] = useState({
    startDate: defaultEndDate,
    endDate: new Date(),
  });

  const [newLabel, setNewLabel] = React.useState(<></>);
  useEffect(() => {
    setNewLabel(<>
      {moment(date.startDate).format('ll')} -{" "}
      {moment(date.endDate).format("ll")}
    </>);
  }, [i18n.language, date]);
  const handleSetDateRangeOnChange = (dateRange) => {
    //setDate(dateRange);
    //onChange(dateRange);
  };
  const handleSetDateRangeOnSubmit = (dateRange) => {
    const startDate = moment(dateRange.startDate);
    const endDate = moment(dateRange.endDate);
    let diffDate;
    switch (granularity) {
      case 'DAILY':
        diffDate= endDate.diff(startDate, 'days');
        if(diffDate <= 30){
          setDate(dateRange);
          onChange(dateRange);
          setInitDateRange(dateRange);
          handleClose();
        } else{
          setShowAlert({show: true, message: t("dailyLimit")});
        }
        break;
      case 'YEARLY':
        diffDate= endDate.diff(startDate, 'years');
        if(diffDate <= 11){
          setDate(dateRange);
          onChange(dateRange);
          setInitDateRange(dateRange);
          handleClose();
        } else{
          setShowAlert({show: true, message: t("annualLimit")});
        }
        break;
      case 'MONTHLY':
        diffDate= endDate.diff(startDate, 'months');
        if(diffDate <= 12){
          setDate(dateRange);
          onChange(dateRange);
          setInitDateRange(dateRange);
          handleClose();
        } else{
          setShowAlert({show: true, message: t("monthlyLimit")});
        }
        break;
    }
  };

  return (
    <>
      {
        showAlert.show && (
          <Dialog open={showAlert.show} >
            <DialogContent>
              <Alert severity="warning" onClose={()=>{setShowAlert({show: false, message: ' '})}}>{showAlert.message}</Alert>
            </DialogContent>
          </Dialog>
        )
      }
      <Button variant="outlined" onClick={handleClick} startIcon={<CalendarIcon />} fullWidth>
        {date?.startDate ? (
          date.endDate ?
            newLabel
           : (
            moment(date.startDate).format('ll')
          )
        ) : (
          <span>{label}</span>
        )}
      </Button>
      <PickerModal
        onChange={(range) => handleSetDateRangeOnChange(range)}
        customProps={{
          onSubmit: (range) => handleSetDateRangeOnSubmit(range),
          onCloseCallback: handleClose,
        }}
        labels={i18n.language === 'fr' ? {
          actions: {
            apply: 'Valider',
            cancel: 'Annuler',
          },
          footer: {
            startDate: 'Date de début',
            endDate: 'Date de fin',
          },
        } : null}
        locale={i18n.language === 'fr' ? fr : enGB}
        definedRanges={getDefaultRanges(new Date(), fr)}
        maxDate={new Date()}
        initialDateRange={initDateRange}
        modalProps={{
          open,
          anchorEl,
          onClose: handleClose,
          slotProps: {
            paper: {
              sx: {
                borderRadius: "16px",
                boxShadow: "rgba(0, 0, 0, 0.21) 0px 0px 4px",
              },
            },
          },
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
        }}
      />
    </>
  );
}