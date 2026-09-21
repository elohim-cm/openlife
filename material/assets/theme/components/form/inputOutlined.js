// Material Dashboard 2 React WebLayout Styles
import colors from "@/material/assets/theme/base/colors";
import borders from "@/material/assets/theme/base/borders";
import typography from "@/material/assets/theme/base/typography";

// Material Dashboard 2 React helper functions
import pxToRem from "@/material/assets/theme/functions/pxToRem";

const { inputBorderColor, info, grey, transparent, white, primary } = colors;
const { borderRadius } = borders;
const { size } = typography;

const inputOutlined = {
  styleOverrides: {
    root: {
      backgroundColor: white.main,
      fontSize: size.sm,
      borderRadius: borderRadius.md,

      "&:hover": {
        backgroundColor: white.main,
        borderBottom: "none !important"
      },
      "&.Mui-focused": {
        border: "none !important",
        background: white.main,
        '&::before': {
          borderBottom: 'none',
        },
        '&::after' : {
          borderBottom: 'none'
        },
        "& .MuiOutlinedInput-notchedOutline": {
          borderColor: primary.main,
        },
      },
    },

    notchedOutline: {
      borderColor: inputBorderColor,
    },

    input: {
      color: grey[700],
      padding: pxToRem(12),
      backgroundColor: transparent.main,
    },

    inputSizeSmall: {
      fontSize: size.xs,
      padding: pxToRem(10),
    },

    multiline: {
      color: grey[700],
      padding: 0,
    },
  },
};

export default inputOutlined;
