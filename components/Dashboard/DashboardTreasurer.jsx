import React, {useState} from "react";
import {useTranslation} from "react-i18next";
import RedemptionIndicators from "@/components/Dashboard/indicators/RedemptionIndicators";
import CommissionIndicators from "@/components/Dashboard/indicators/CommissionIndicators";

const DashboardTreasurer = () => {
  const {t} = useTranslation();
    const [focusCommission, setFocusCommission] = useState(false);

  return (
    <>
      <RedemptionIndicators onGotData={() => {
          setFocusCommission(true);
      }} />
        <br />
        {<CommissionIndicators
            focus={focusCommission}
            onGotData={() => {}}
        />}
    </>
  );
};

export default DashboardTreasurer;
