import * as React from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import {useCallback, useEffect, useState} from "react";
import {getToken} from "@/utils";
import {BASE_URL} from "@/utils/api/api";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import {FormControl} from "@mui/material";

export default function MultiSelectBox({label, onSelect}) {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = getToken();

  // Fetch providers list
  const getRecord = useCallback(async () => {
    setLoading(true);
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
        'Without-Pagination': true
      },
    };

    const url = new URL(`${BASE_URL}/provider`);
    const response = await axios.get(url.href, config);
    const result = await response.data;
    if(result.error == null) {
      //console.log('result',result.data.providers);
      setProviders(result.data.providers);
      setLoading(false);
      //alert();
    }
  }, []);

  useEffect(() => {
    //getRecord();
  }, []);


  return (
    <FormControl spacing={3} sx={{width: "100%"}}>
      <Autocomplete
        id="tags-outlined"
        options={providers}
        loading={loading}
        onOpen={getRecord}
        getOptionLabel={option =>
          (option.code ? option.access.code : "") +
          " | " +
          (option.first_name ? option.first_name : "") +
          " " +
          (option.last_name ? option.last_name : "")
        }
        onChange={(event, newValue) => onSelect(newValue)}
        filterSelectedOptions
        renderInput={params => (
          <TextField
            {...params}
            placeholder={label}
            InputProps={{
              ...params.InputProps,
              sx: {height: 35},
              endAdornment: (
                <>
                  {providers.length < 1 && loading ? <CircularProgress color="inherit" size={20} /> : null}
                  {params.InputProps.endAdornment}
                </>
              ),
            }}
          />
        )}
        renderOption={(props, option) => (
          <li {...props} key={option.code}>
            {(option.code ? option.code : "") +
              " | " +
              (option.first_name ? option.first_name : "") +
              " " +
              (option.last_name ? option.last_name : "")}
          </li>
        )}
      />
    </FormControl>
  );
}