import React from "react";
import {Box, Button, Typography} from "@mui/material";
import {h7} from "@/utils/style";
import AppTable from "@/components/AppTable";
import {formatNumberStr} from "@/utils";
import {useTranslation} from "react-i18next";
import {motion, useReducedMotion} from "framer-motion";

const SimulationTable = ({datas = [], onSubscribe}) => {
  const {t, i18n} = useTranslation();
  const reduceMotion = Boolean(useReducedMotion());
  const finalResult = datas.length > 0 ? datas[datas.length - 1] : null;
  const numberLocale = i18n.resolvedLanguage?.startsWith("en") ? "en" : "fr";
  const formatSimulationAmount = value => `${formatNumberStr(value, numberLocale, "XAF", true, 0)} FCFA`;

  const columns = [
    {name: "id", label: t("identifier")},
    {name: "annee", label: t("annee")},
    {name: "amount", label: `${t("amount")} (FCFA)`},
    {name: "rachat_value", label: `${t("redemptionValue")} (FCFA)`},
    {name: "taux", label: `${t("rate")} (%)`, filter: false, sort: false},
  ];

  return (
    <div className="__container-form simulation-results-card">
      <Box className="simulation-results-shell">
        <Box className="simulation-results-header">
          <Typography component="h2" sx={h7}>{t("evolutionOfRedemptionValues")}</Typography>
          {datas.length > 0 ? (
            <div className="simulation-subscribe-action">
              <Button variant="contained" size="large" onClick={onSubscribe}>
                {t("subscribe")}
              </Button>
            </div>
          ) : (
            <></>
          )}
        </Box>
        {datas.length > 0 ? (
          <motion.div
            className="simulation-results-content"
            initial={reduceMotion ? false : {opacity: 0, y: 18}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.55, ease: [0.22, 1, 0.36, 1]}}
          >
            <div className="simulation-summary-grid">
              <div className="simulation-summary-card">
                <p>{t("cumulativeGrossPrime")}</p>
                <strong>{formatSimulationAmount(finalResult.amount)}</strong>
              </div>
              <div className="simulation-summary-card">
                <p>{t("redemptionValueAtTerm")}</p>
                <strong>{formatSimulationAmount(finalResult.rachat_value)}</strong>
              </div>
            </div>

            <div className="simulation-results-table-wrap">
              <AppTable
                key={`simulation-table-${i18n.resolvedLanguage ?? i18n.language}`}
                columns={columns}
                data={datas.map(item => ({
                  ...item,
                  amount: formatSimulationAmount(item.amount),
                  rachat_value: formatSimulationAmount(item.rachat_value),
                }))}
                tableContainer={undefined}
                elevation={0}
                styledRow={false}
                className="simulation-results-table"
                sx={{maxHeight: "500px", overflow: "auto"}}
                tableProps={{stickyHeader: true}}
              />
            </div>
          </motion.div>
        ) : (
          <></>
        )}
      </Box>

    </div>
  );
};

export default SimulationTable;
