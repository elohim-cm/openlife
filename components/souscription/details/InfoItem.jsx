import MDTypography from "@/material/components/MDTypography";
import React from "react";

/**
 *
 * @param label {string|any}
 * @param value {string|any}
 * @param second {{label: string, value: string}}
 * @returns {Element}
 * @constructor
 */
const InfoItem = ({label, value, second}) => {
  return (
    <div className="__flex-row __two">
      <div>
        <MDTypography style={{wordBreak:"break-all!important"}} color="secondary" variant="button" component="span" fontWeight="medium">
          {label}&nbsp;:&nbsp;
        </MDTypography>
        <MDTypography style={{wordBreak:"break-all!important"}} color="secondary" variant="button" component="span">
          {value}
        </MDTypography>
      </div>
      {second ? (
        <div>
          <MDTypography style={{wordBreak:"break-all!important"}} color="secondary" variant="button" component="span" fontWeight="medium">
            {second.label}&nbsp;:&nbsp;
          </MDTypography>
          <MDTypography style={{wordBreak:"break-all!important"}} color="secondary" variant="button" component="span">
            {second.value}
          </MDTypography>
        </div>
      ) : (
        <></>
      )}
    </div>
  );
};

export default InfoItem;
