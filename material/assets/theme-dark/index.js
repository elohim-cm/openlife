/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

// @mui material components
import { createTheme } from "@mui/material/styles";
// import Fade from "@mui/material/Fade";

// Material Dashboard 2 React base styles
import colors from "@/material/assets/theme-dark/base/colors";
import breakpoints from "@/material/assets/theme-dark/base/breakpoints";
import typography from "@/material/assets/theme-dark/base/typography";
import boxShadows from "@/material/assets/theme-dark/base/boxShadows";
import borders from "@/material/assets/theme-dark/base/borders";
import globals from "@/material/assets/theme-dark/base/globals";

// Material Dashboard 2 React helper functions
import boxShadow from "@/material/assets/theme-dark/functions/boxShadow";
import hexToRgb from "@/material/assets/theme-dark/functions/hexToRgb";
import linearGradient from "@/material/assets/theme-dark/functions/linearGradient";
import pxToRem from "@/material/assets/theme-dark/functions/pxToRem";
import rgba from "@/material/assets/theme-dark/functions/rgba";

// Material Dashboard 2 React components base styles for @mui material components
import sidenav from "@/material/assets/theme-dark/components/sidenav";
import list from "@/material/assets/theme-dark/components/list";
import listItem from "@/material/assets/theme-dark/components/list/listItem";
import listItemText from "@/material/assets/theme-dark/components/list/listItemText";
import card from "@/material/assets/theme-dark/components/card";
import cardMedia from "@/material/assets/theme-dark/components/card/cardMedia";
import cardContent from "@/material/assets/theme-dark/components/card/cardContent";
import button from "@/material/assets/theme-dark/components/button";
import iconButton from "@/material/assets/theme-dark/components/iconButton";
import input from "@/material/assets/theme-dark/components/form/input";
import inputLabel from "@/material/assets/theme-dark/components/form/inputLabel";
import inputOutlined from "@/material/assets/theme-dark/components/form/inputOutlined";
import textField from "@/material/assets/theme-dark/components/form/textField";
import menu from "@/material/assets/theme-dark/components/menu";
import menuItem from "@/material/assets/theme-dark/components/menu/menuItem";
import switchButton from "@/material/assets/theme-dark/components/form/switchButton";
import divider from "@/material/assets/theme-dark/components/divider";
import tableContainer from "@/material/assets/theme-dark/components/table/tableContainer";
import tableHead from "@/material/assets/theme-dark/components/table/tableHead";
import tableCell from "@/material/assets/theme-dark/components/table/tableCell";
import linearProgress from "@/material/assets/theme-dark/components/linearProgress";
import breadcrumbs from "@/material/assets/theme-dark/components/breadcrumbs";
import slider from "@/material/assets/theme-dark/components/slider";
import avatar from "@/material/assets/theme-dark/components/avatar";
import tooltip from "@/material/assets/theme-dark/components/tooltip";
import appBar from "@/material/assets/theme-dark/components/appBar";
import tabs from "@/material/assets/theme-dark/components/tabs";
import tab from "@/material/assets/theme-dark/components/tabs/tab";
import stepper from "@/material/assets/theme-dark/components/stepper";
import step from "@/material/assets/theme-dark/components/stepper/step";
import stepConnector from "@/material/assets/theme-dark/components/stepper/stepConnector";
import stepLabel from "@/material/assets/theme-dark/components/stepper/stepLabel";
import stepIcon from "@/material/assets/theme-dark/components/stepper/stepIcon";
import select from "@/material/assets/theme-dark/components/form/select";
import formControlLabel from "@/material/assets/theme-dark/components/form/formControlLabel";
import formLabel from "@/material/assets/theme-dark/components/form/formLabel";
import checkbox from "@/material/assets/theme-dark/components/form/checkbox";
import radio from "@/material/assets/theme-dark/components/form/radio";
import autocomplete from "@/material/assets/theme-dark/components/form/autocomplete";
import container from "@/material/assets/theme-dark/components/container";
import popover from "@/material/assets/theme-dark/components/popover";
import buttonBase from "@/material/assets/theme-dark/components/buttonBase";
import icon from "@/material/assets/theme-dark/components/icon";
import svgIcon from "@/material/assets/theme-dark/components/svgIcon";
import link from "@/material/assets/theme-dark/components/link";
import dialog from "@/material/assets/theme-dark/components/dialog";
import dialogTitle from "@/material/assets/theme-dark/components/dialog/dialogTitle";
import dialogContent from "@/material/assets/theme-dark/components/dialog/dialogContent";
import dialogContentText from "@/material/assets/theme-dark/components/dialog/dialogContentText";
import dialogActions from "@/material/assets/theme-dark/components/dialog/dialogActions";

export default createTheme({
  breakpoints: { ...breakpoints },
  palette: { ...colors },
  typography: { ...typography },
  boxShadows: { ...boxShadows },
  borders: { ...borders },
  functions: {
    boxShadow,
    hexToRgb,
    linearGradient,
    pxToRem,
    rgba,
  },

  components: {
    MuiCssBaseline: {
      styleOverrides: {
        ...globals,
        ...container,
      },
    },
    MuiDrawer: { ...sidenav },
    MuiList: { ...list },
    MuiListItem: { ...listItem },
    MuiListItemText: { ...listItemText },
    MuiCard: { ...card },
    MuiCardMedia: { ...cardMedia },
    MuiCardContent: { ...cardContent },
    MuiButton: { ...button },
    MuiIconButton: { ...iconButton },
    MuiInput: { ...input },
    MuiInputLabel: { ...inputLabel },
    MuiOutlinedInput: { ...inputOutlined },
    MuiTextField: { ...textField },
    MuiMenu: { ...menu },
    MuiMenuItem: { ...menuItem },
    MuiSwitch: { ...switchButton },
    MuiDivider: { ...divider },
    MuiTableContainer: { ...tableContainer },
    MuiTableHead: { ...tableHead },
    MuiTableCell: { ...tableCell },
    MuiLinearProgress: { ...linearProgress },
    MuiBreadcrumbs: { ...breadcrumbs },
    MuiSlider: { ...slider },
    MuiAvatar: { ...avatar },
    MuiTooltip: { ...tooltip },
    MuiAppBar: { ...appBar },
    MuiTabs: { ...tabs },
    MuiTab: { ...tab },
    MuiStepper: { ...stepper },
    MuiStep: { ...step },
    MuiStepConnector: { ...stepConnector },
    MuiStepLabel: { ...stepLabel },
    MuiStepIcon: { ...stepIcon },
    MuiSelect: { ...select },
    MuiFormControlLabel: { ...formControlLabel },
    MuiFormLabel: { ...formLabel },
    MuiCheckbox: { ...checkbox },
    MuiRadio: { ...radio },
    MuiAutocomplete: { ...autocomplete },
    MuiPopover: { ...popover },
    MuiButtonBase: { ...buttonBase },
    MuiIcon: { ...icon },
    MuiSvgIcon: { ...svgIcon },
    MuiLink: { ...link },
    MuiDialog: { ...dialog },
    MuiDialogTitle: { ...dialogTitle },
    MuiDialogContent: { ...dialogContent },
    MuiDialogContentText: { ...dialogContentText },
    MuiDialogActions: { ...dialogActions },
  },
});
