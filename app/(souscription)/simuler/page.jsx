"use client";

import React from "react";
import "@/styles/flex.scss";
import "@/styles/souscription.scss";
import SousHeader from "@/components/souscription/SousHeader";
import {Typography} from "@mui/material";
import SimulationForm from "@/components/souscription/SimulationForm";
import SimulationTable from "@/components/souscription/SimulationTable";
import {useRouter} from "next/navigation";
import Routes from "@/utils/routes";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import {getToken, getUrlParams} from "@/utils";
import {useTranslation} from "react-i18next";
import AffiliationLogoutModal from "@/components/souscription/AffiliationLogoutModal";
import {motion, useReducedMotion} from "framer-motion";

const SimulerPage = () => {
  const [table, setTable] = React.useState([]);
  const [prime, setPrime] = React.useState(0);
  const [duree, setDuree] = React.useState(0);
  const [pageLoading, setPageLoading] = React.useState(false);
  const [showLogoutModal, setShowLogoutModal] = React.useState(false);
  const {t} = useTranslation();
  const router = useRouter();
  const token = getToken();
  const reduceMotion = Boolean(useReducedMotion());

  React.useEffect(() => {
    const params = getUrlParams();
    const hasRef = params.some(p => p.label === "ref" && p.value);
    if (hasRef && token) {
      setShowLogoutModal(true);
    }
  }, []);

  const handleSimulationSubmit = (_tab, {prime, duree}) => {
    setTable(_tab);
    setPrime(prime);
    setDuree(duree);
  };

  return (
    <div className="sous-container" id="__contaner-test">
      <PageLoadingIndicator visible={pageLoading} />
      <div className="sous-real-container">
        <SousHeader
          onBack={() => {
            router.back();
            setPageLoading(true);
          }}
        />
        <motion.div className="sous-simulation-title" initial={reduceMotion ? false : {opacity: 0, y: 22}} animate={{opacity: 1, y: 0}} transition={{duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.08, ease: [0.22, 1, 0.36, 1]}} align="center">
          <Typography component="h1" variant="h3">
            {t("performASimulation")}
          </Typography>
        </motion.div>
        <div className="sous-simulation __contaner-smulaton">
          <motion.div className="simulation-form-column" initial={reduceMotion ? false : {opacity: 0, x: -28}} animate={{opacity: 1, x: 0}} transition={{duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.14, ease: [0.22, 1, 0.36, 1]}}>
            <SimulationForm token={token} onSubmit={handleSimulationSubmit} />
          </motion.div>
          <motion.div className="simulation-result-column" initial={reduceMotion ? false : {opacity: 0, x: 28}} animate={{opacity: 1, x: 0}} transition={{duration: reduceMotion ? 0 : 0.7, delay: reduceMotion ? 0 : 0.18, ease: [0.22, 1, 0.36, 1]}}>
            <SimulationTable
              onSubscribe={() => {
                const params = getUrlParams();
                const refParam = params.find(p => p.label === "ref");
                const routeParams = [
                  {label: "prime", value: prime},
                  {label: "duration", value: duree},
                ];
                if (refParam) {
                  routeParams.push({label: "ref", value: refParam.value});
                }
                router.push(Routes.withParams(Routes.SOUSCRIPTION, routeParams));
                setPageLoading(true);
              }}
              datas={table}
            />
          </motion.div>
        </div>
      </div>
      <AffiliationLogoutModal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
      />
    </div>
  );
};

export default SimulerPage;
