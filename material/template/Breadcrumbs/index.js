import PropTypes from "prop-types";

// @mui material components
import {Breadcrumbs as MuiBreadcrumbs} from "@mui/material";

import MDBox from "@/material/components/MDBox";
import MDTypography from "@/material/components/MDTypography";
import Link from "next/link";
import {breadcrumbStyle, navbarContainer} from "@/material/template/Navbars/DashboardNavbar/styles";

function Breadcrumbs({icon, title, route, light = false, isMini=false}) {
  const routes = route.slice(0, -1);

  return (
    <MDBox mr={{xs: 0, xl: 8}}>
      <MuiBreadcrumbs
          sx={theme => breadcrumbStyle(theme, {isMini}, light)}
      >
        <Link href="/">
          <MDTypography
            component="span"
            variant="body2"
            color={light ? "white" : "dark"}
            opacity={light ? 0.8 : 0.5}
            sx={{lineHeight: 0}}>
            {icon}
          </MDTypography>
        </Link>
        {routes.map(el => (
          <Link href={`/${el}`} key={el}>
            <MDTypography
              component="span"
              variant="button"
              fontWeight="regular"
              textTransform="capitalize"
              color={light ? "white" : "dark"}
              opacity={light ? 0.8 : 0.5}
              sx={{lineHeight: 0}}>
              {el}
            </MDTypography>
          </Link>
        ))}
        <MDTypography
          variant="button"
          fontWeight="regular"
          textTransform="capitalize"
          color={light ? "white" : "dark"}
          sx={{lineHeight: 0}}>
          {title.replace("-", " ")}
        </MDTypography>
      </MuiBreadcrumbs>
      <MDTypography fontWeight="bold" textTransform="capitalize" variant="h6" color={light ? "white" : "dark"} noWrap>
        {title.replace("-", " ")}
      </MDTypography>
    </MDBox>
  );
}

// Typechecking props for the Breadcrumbs
Breadcrumbs.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  route: PropTypes.oneOfType([PropTypes.string, PropTypes.array]).isRequired,
  light: PropTypes.bool,
};

export default Breadcrumbs;
