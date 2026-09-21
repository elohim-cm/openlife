'use client'
import OL from '@/themes/theme'
import { ThemeProvider } from '@emotion/react'
import { CssBaseline } from "@mui/material";

const ThemeWrapper = ({ children }) => {
  return (
    <ThemeProvider theme={ OL }>
      <CssBaseline/>
      { children }
    </ThemeProvider>
  );
};

export default ThemeWrapper;