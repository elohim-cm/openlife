import "react-international-phone/style.css";
import {InputAdornment, MenuItem, Select, TextField, Typography} from "@mui/material";
import React from "react";
import {defaultCountries, FlagImage, parseCountry, usePhoneInput} from "react-international-phone";
import {useTranslation} from "react-i18next";

const IntlPhoneField = ({value, onChange, formHook = false, ...restProps}) => {
  const {t, i18n} = useTranslation();
  const regionNames = React.useMemo(() => {
    if (typeof Intl.DisplayNames === "undefined") return null;
    return new Intl.DisplayNames([i18n.resolvedLanguage || i18n.language || "fr"], {type: "region"});
  }, [i18n.language, i18n.resolvedLanguage]);
  const {inputValue, handlePhoneValueChange, inputRef, country, setCountry} = usePhoneInput({
    defaultCountry: "cm",
    value,
    countries: defaultCountries,
    onChange: data => {
      onChange(data.phone);
    },
  });

  return (
    <TextField
      variant="outlined"
      label={t("phoneNumber")}
      color="primary"
      placeholder={t("phoneNumber")}
      value={inputValue}
      onChange={handlePhoneValueChange}
      type="tel"
      inputRef={inputRef}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start" style={{marginRight: "2px", marginLeft: "-8px"}}>
            <Select
              MenuProps={{
                style: {
                  height: "300px",
                  width: "360px",
                  top: "10px",
                  left: "-34px",
                },
                transformOrigin: {
                  vertical: "top",
                  horizontal: "left",
                },
              }}
              sx={{
                width: "max-content",
                // Remove default outline (display only on focus)
                fieldset: {
                  display: "none",
                },
                '&.Mui-focused:has(div[aria-expanded="false"])': {
                  fieldset: {
                    display: "block",
                  },
                },
                // Update default spacing
                ".MuiSelect-select": {
                  padding: "8px",
                  paddingRight: "24px !important",
                },
                svg: {
                  right: 0,
                },
              }}
              value={country.iso2}
              onChange={e => setCountry(e.target.value)}
              renderValue={value => <FlagImage iso2={value} style={{display: "flex"}} />}>
              {defaultCountries.map(c => {
                const country = parseCountry(c);
                return (
                  <MenuItem key={country.iso2} value={country.iso2}>
                    <FlagImage iso2={country.iso2} style={{marginRight: "8px"}} />
                    <Typography marginRight="8px">{regionNames?.of(country.iso2.toUpperCase()) || country.name}</Typography>
                    <Typography color="gray">+{country.dialCode}</Typography>
                  </MenuItem>
                );
              })}
            </Select>
          </InputAdornment>
        ),
      }}
      {...restProps}
    />
  );
};

export default IntlPhoneField;
