import MDBox from "@/material/components/MDBox";
import {Button, ButtonGroup} from "@mui/material";
import Constants from "@/utils/constants";
import Routes from "@/utils/routes";
import SousInfo from "@/components/souscription/details/SousInfo";
import MDTypography from "@/material/components/MDTypography";
import SousBenef from "@/components/souscription/details/SousBenefVie";
import TransferSubscriptionModal from "@/components/souscription/modals/TransferSubscriptionModal";
import React, {useCallback, useEffect} from "react";
import {getToken} from "@/utils";
import {useAppContext} from "@/contexts/appContext";
import {useRouter} from "next/navigation";
import SubscriptionService from "@/services/SubscriptionService";
import {displayHttpError} from "@/utils/api";
import Toast from "@/utils/toast";
import {useTranslation} from "react-i18next";

const SousDetailsComponent = ({uid, data}) => {
  const {t} = useTranslation();
  const [record, setRecord] = React.useState(data);
  const token = getToken();
  const context = useAppContext();
  const router = useRouter();

  useEffect(() => {
    context.togglePageLoading();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRecord = useCallback(
    async _uid => {
      const result = await SubscriptionService.show(token, _uid);
      if (!result.error) {
        setRecord(result.data);
      } else {
        displayHttpError(result.error, router);
      }
    },
    [router, token],
  );

  React.useEffect(() => {
    if (token == null || token === "") router.push(Routes.LOGIN);
    if (!data) getRecord(uid);
  }, [data, getRecord, router, token, uid]);

  return (
    <MDBox mt={2}>
      <SousInfo record={record} />
      <MDTypography variant="h6" mb={1}>
          {t("lifeBeneficiaries")}
      </MDTypography>
      <SousBenef record={record ? record.life_beneficiaries : null} />
      <MDTypography variant="h6" mb={1}>
          {t("deathBeneficiaries")}
      </MDTypography>
      <SousBenef record={record ? record.death_beneficiaries : null} />
      <MDTypography variant="h6" mb={1}>
          {t("contactPersonInCaseOfDeath")}
      </MDTypography>
      <SousBenef record={record ? record.person_contacts : null} />
    </MDBox>
  );
};

export default SousDetailsComponent;
