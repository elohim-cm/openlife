const getColorByIndicator = (_theme, _value) => {
  let color = _theme.palette.primary;
  if (_value <= 25) {
    color = _theme.palette.error;
  } else if (_value > 25 && _value <= 50) {
    color = _theme.palette.warning;
  } else if (_value > 50 && _value <= 75) {
    color = _theme.palette.yellow;
  } else if (_value > 75 && _value <= 100) {
    color = _theme.palette.primary;
  }
  return color;
};

export {getColorByIndicator};
