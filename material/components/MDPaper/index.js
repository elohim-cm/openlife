import {forwardRef} from "react";
import {useMaterialUIController} from "@/material/context";
import {Paper} from "@mui/material";
import MDPaperRoot from "@/material/components/MDPaper/MDPaperRoot";

const MDPaper = forwardRef(
    (
        { children, ...rest },
        ref
    ) => {
        const [controller] = useMaterialUIController();
        const { darkMode } = controller;

        return (
            <MDPaperRoot
                {...rest}
                ref={ref}
                ownerState={{ darkMode }}>
                { children }
            </MDPaperRoot>
        );
    });

export default MDPaper;