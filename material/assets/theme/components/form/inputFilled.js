// Material Dashboard 2 React WebLayout Styles
import colors from "@/material/assets/theme/base/colors";
import borders from "@/material/assets/theme/base/borders";
import typography from "@/material/assets/theme/base/typography";

// Material Dashboard 2 React helper functions
import pxToRem from "@/material/assets/theme/functions/pxToRem";

const { inputBorderColor, info, grey, transparent, white, primary } = colors;
const { borderRadius } = borders;
const { size } = typography;

const inputFilled = {
    styleOverrides: {
        root: {
            background: white.main,
            fontSize: size.sm,
            '&:hover': {
                background: white.main,
            },
            '&.Mui-focused': {
                background: white.main,
            }
        },
    },
};

export default inputFilled;
