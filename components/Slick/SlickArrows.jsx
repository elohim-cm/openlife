import React from "react";

export function SlickNextArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "flex", justifyItems: "center", alignItems: "center", borderRadius: 9999 }}
      onClick={onClick}/>
  );
}

export function SlickPrevArrow(props) {
  const { className, style, onClick } = props;
  return (
    <div
      className={className}
      style={{ ...style, display: "flex", justifyItems: "center", alignItems: "center", borderRadius: 9999 }}
      onClick={onClick}
    />
  );
}