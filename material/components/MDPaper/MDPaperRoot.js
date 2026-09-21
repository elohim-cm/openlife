import {styled} from "@mui/material/styles";
import {Paper} from "@mui/material";
export default styled(Paper)(({ theme, ownerState }) => {
    const { palette } = theme;
    const { darkMode } =
        ownerState;
    const { dark, white } = palette;

    return {
        backgroundColor: darkMode ? dark.main : white.main
    };
});