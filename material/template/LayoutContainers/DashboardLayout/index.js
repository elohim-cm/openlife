import {useEffect} from "react";

// prop-types is a library for typechecking of props.
import PropTypes from "prop-types";

// Material Dashboard 2 React components
import MDBox from "@/material/components/MDBox";

// Material Dashboard 2 React context
import {useMaterialUIController, setLayout} from "@/material/context";
import {usePathname} from "next/navigation";
import AlertConnection from "@/components/AlertConnection";

function DashboardLayout({children}) {
  const [controller, dispatch] = useMaterialUIController();
  const {miniSidenav} = controller;
  const pathname = usePathname();

  useEffect(() => {
    setLayout(dispatch, "dashboard");
  }, [pathname, dispatch]);

  return (
    <>
        <AlertConnection />
        <MDBox
            sx={({breakpoints, transitions, functions: {pxToRem}}) => ({
                pr: 3,
                pl: 3,
                position: "relative",
                [breakpoints.up("xl")]: {
                    marginLeft: miniSidenav ? pxToRem(120) : pxToRem(274),
                    transition: transitions.create(["margin-left", "margin-right"], {
                        easing: transitions.easing.easeInOut,
                        duration: transitions.duration.standard,
                    }),
                },
            })}>
            {children}
        </MDBox>
    </>
  );
}

// Typechecking props for the DashboardLayout
DashboardLayout.propTypes = {
  children: PropTypes.node.isRequired,
};

export default DashboardLayout;
