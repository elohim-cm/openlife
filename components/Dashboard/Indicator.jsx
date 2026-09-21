import {Box, Link, Paper, Stack, Tooltip, Typography} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import Image from "next/image";
import {formatNumber, formatNumberStr, getLanguage} from "@/utils";

const Indicator = ({color = "primary", title = "Title here", link = "#", img, counter = 0}) => {
  return (
    <Paper>
      <Tooltip title={title+': '+formatNumberStr(counter)}>
        <Stack direction="column" sx={{padding: "24px"}}>
          <Box>
            <Stack direction={{xs: "column", sm: "column", md: "row"}} justifyContent="space-between" alignItems="center">
              <Image src={img} width={56} height={50} alt="" />
              <Typography sx={{whiteSpace: 'nowrap',overflow: 'hidden', textOverflow: 'ellipsis'}} color={color} variant="h6" component="h6" ml={1} mb={1}>
                {title}
              </Typography>
            </Stack>
          </Box>
          <Typography color={color} variant="h5" component="h5" sx={{fontSize: '1rem', mt:1, mb:1}}>
            {formatNumberStr(counter)}
          </Typography>
          <Link
            href={link}
            color="error"
            underline="none"
            aria-label="En savoir plus"
            sx={{display: "flex", alignItems: "center", gap: "4px", alignSelf: "end"}}>
            Voir plus
            <ArrowForwardIcon />
          </Link>
        </Stack>
      </Tooltip>
    </Paper>
  );
};

export default Indicator;
