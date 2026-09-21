function collapseChildren(theme, ownerState) {
  const {palette} = theme;
  const {transparentSidenav, whiteSidenav, darkMode} = ownerState;
  const {white, black} = palette;

  return {
    "&.__sidenav-children::before": {
      color: (transparentSidenav && !darkMode) || whiteSidenav ? white.main : black.main,
      backgroundImage:
        (transparentSidenav && !darkMode) || whiteSidenav
          ? `linear-gradient(to bottom, rgba(0, 0, 0, 0), rgba(0, 0, 0, .65), rgba(0, 0, 0, 0))`
          : `linear-gradient(to bottom, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0.65), rgba(255, 255, 255, 0))`,
    },
  };
}

function collapseItem(theme, ownerState) {
  const {palette, transitions, breakpoints, boxShadows, borders, functions} = theme;
  const {active, transparentSidenav, whiteSidenav, darkMode, sidenavColor, isChild} = ownerState;

  const {white, transparent, grey, gradients, black} = palette;
  const {md} = boxShadows;
  const {borderRadius} = borders;
  const {pxToRem, rgba, linearGradient} = functions;

  return {
    background: isChild
      ? active
        ? linearGradient(gradients.sidenav_child.main, gradients.sidenav_child.state)
        : transparent.main
      : active
      ? linearGradient(gradients[sidenavColor].main, gradients[sidenavColor].state)
      : transparent.main,
    color: !active
      ? (transparentSidenav && !darkMode) || whiteSidenav
        ? black.main
        : white.main
      : (transparentSidenav && !darkMode) || whiteSidenav
      ? white.main
      : black.main,
    display: "flex",
    alignItems: "center",
    width: "100%",
    padding: `${pxToRem(8)} ${pxToRem(5)}`,
    margin: `${pxToRem(1.5)} ${pxToRem(1)}`,
    textOverflow: "ellipsis",
    borderRadius: borderRadius.md,
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    boxShadow: active && !whiteSidenav && !darkMode && !transparentSidenav ? md : "none",
    [breakpoints.up("xl")]: {
      transition: transitions.create(["box-shadow", "background-color"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.shorter,
      }),
    },

    "&:hover, &:focus": {
      backgroundColor: () => {
        let backgroundValue;

        if (!active) {
          backgroundValue =
            transparentSidenav && !darkMode ? grey[300] : rgba(whiteSidenav ? grey[400] : white.main, 0.2);
        }

        return backgroundValue;
      },
    },
  };
}

function collapseIconBox(theme, ownerState) {
  const {palette, transitions, borders, functions} = theme;
  const {transparentSidenav, whiteSidenav, darkMode, active} = ownerState;

  const {white, dark, black} = palette;
  const {borderRadius} = borders;
  const {pxToRem} = functions;

  return {
    minWidth: pxToRem(32),
    minHeight: pxToRem(32),
    color: !active
      ? (transparentSidenav && !darkMode) || whiteSidenav
        ? black.main
        : white.main
      : (transparentSidenav && !darkMode) || whiteSidenav
      ? white.main
      : black.main,
    borderRadius: borderRadius.md,
    display: "grid",
    placeItems: "center",
    transition: transitions.create("margin", {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.standard,
    }),

    "& svg, svg g": {
      color: !active
        ? (transparentSidenav && !darkMode) || whiteSidenav
          ? black.main
          : white.main
        : (transparentSidenav && !darkMode) || whiteSidenav
        ? white.main
        : black.main,
    },
  };
}

const collapseIcon = ({palette: {black, gradients}}, {active}) => ({
  color: active ? black.main : gradients.dark.state,
});

function collapseText(theme, ownerState) {
  const {typography, transitions, breakpoints, functions} = theme;
  const {miniSidenav, transparentSidenav, active} = ownerState;

  const {size, fontWeightRegular, fontWeightLight} = typography;
  const {pxToRem} = functions;

  return {
    marginLeft: pxToRem(10),

    [breakpoints.up("xl")]: {
      opacity: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : 1,
      maxWidth: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : "100%",
      marginLeft: miniSidenav || (miniSidenav && transparentSidenav) ? 0 : pxToRem(10),
      transition: transitions.create(["opacity", "margin"], {
        easing: transitions.easing.easeInOut,
        duration: transitions.duration.standard,
      }),
    },

    "& span": {
      fontWeight: active ? fontWeightRegular : fontWeightLight,
      fontSize: size.sm,
      lineHeight: 0,
    },
  };
}

export {collapseItem, collapseIconBox, collapseIcon, collapseText, collapseChildren};
