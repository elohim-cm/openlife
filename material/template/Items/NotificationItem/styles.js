function menuItem(theme) {
  const { palette, borders, transitions } = theme;

  const { secondary, light, dark, primary} = palette;
  const { borderRadius } = borders;

  return {
    display: "flex",
    alignItems: "center",
    width: "100%",
    color: secondary.main,
    borderRadius: borderRadius.md,
    transition: transitions.create("background-color", {
      easing: transitions.easing.easeInOut,
      duration: transitions.duration.standard,
    }),

    "& *": {
      transition: "color 100ms linear",
    },

    "&:not(:last-child)": {
      mb: 1,
    },

    "&:hover, &.active": {
      backgroundColor: primary.main,

      "& *": {
        color: light.main,
      },
    },
  };
}

export default menuItem;
