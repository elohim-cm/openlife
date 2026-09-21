import React, {useEffect} from "react";
import {Box, Typography} from "@mui/material";
import LinearProgress from "@mui/material/LinearProgress";

function LinearProgressWithLabel(props) {
  useEffect(() => {
    const elems = document.querySelectorAll("span.MuiLinearProgress-bar");
    if (elems) {
      elems.forEach(elem => {
        const styleElem = elem.getAttribute("style");
        if (styleElem) {
          const style = styleElem.split(";");
          if (style.length > 0 && style[0].indexOf("important") === -1) {
            elem.setAttribute("style", `${style[0]} !important;`);
          }
        }
      });
    }
  }, []);

  return (
    <Box sx={{display: "flex", alignItems: "center", minWidth: "100px"}}>
      <Box sx={{width: "100%", mr: 1}}>
        <LinearProgress variant="determinate" {...props} value={props.value > 100 ? 100 : props.value} />
      </Box>
      <Box sx={{minWidth: 35}}>
        <Typography variant="body2" color="text.secondary">{`${Math.round(props.value)}%`}</Typography>
      </Box>
    </Box>
  );
}

export default LinearProgressWithLabel;
