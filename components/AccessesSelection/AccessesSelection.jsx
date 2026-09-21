"use client";

import React, {useEffect, useRef, useState} from "react";
import {motion, useReducedMotion} from "framer-motion";
import {
  AccountCircle, AdminPanelSettings, DisplaySettings,
  Engineering, LockOutlined, ManageAccounts, People, Person, Person3, Person4,
} from "@mui/icons-material";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import "@/styles/souscription.scss";
import styles from "@/styles/access-selection.module.scss";
import AccessesSelectionSkeleton from "@/components/AccessesSelection/AccessesSelectionSkeleton";
import PageLoadingIndicator from "@/components/PageLoadingIndicator";
import SousHeader from "@/components/souscription/SousHeader";
import TwoFAModal from "@/components/TwoFAModal";
import {getUserAccess} from "@/services/accountService";
import Habilitation from "@/services/Habilitation";
import AuthService from "@/services/AuthService";
import {useAppContext} from "@/contexts/appContext";
import {getToken} from "@/utils";
import {DASHBOARD_PAGE} from "@/utils/routes/routes";
import Routes from "@/utils/routes";
import Toast from "@/utils/toast";
import UtilMethods from "@/utils/UtilMethods";

const roleIcons = {
  ADMIN: AdminPanelSettings,
  APP: Person,
  SOUS: Person,
  DCOM: DisplaySettings,
  SCL: People,
  TECH: DisplaySettings,
  TRE: AccountCircle,
  PDG: ManageAccounts,
  INP: Person3,
  MNG: Engineering,
  ANM: Person4,
};

const AccessesSelection = () => {
  const [access, setAccess] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [name, setName] = useState("");
  const [pageLoading, setPageLoading] = useState(false);
  const {t} = useTranslation();
  const reduceMotion = Boolean(useReducedMotion());
  const twoFaRef = useRef(null);
  const router = useRouter();
  const token = getToken();
  const context = useAppContext();

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push(Routes.LOGIN);
      return;
    }

    const local = JSON.parse(localStorage.getItem("storedValues")) || {};
    setAccess(local.access || []);
    setName([local.lastName, local.firstName].filter(Boolean).join(" "));
  }, [router]);

  const handleRoleSelection = async (selectedAccess, otp = null, trustDevice = false) => {
    if (!selectedAccess) return;

    try {
      setPageLoading(true);
      const {uid: accessUid, role} = selectedAccess;
      const token = getToken();
      const response = await getUserAccess(accessUid, token, otp, trustDevice);

      twoFaRef.current?.toggleLoader(false);
      if (response.error) {
        const status = response.error.response?.status;
        const data = response.error.response?.data;

        if (status === 403 && data?.two_step) {
          Toast.warn(data.message);
          setPendingData(selectedAccess);
          setPageLoading(false);
          twoFaRef.current?.open(
            data.data,
            "notif_2fa",
            data.method,
            data.available_methods,
          );
          return;
        }

        throw response.error;
      }

      twoFaRef.current?.close();
      const authorizations = response.authorizations;
      localStorage.setItem("currentAccess", accessUid);

      let storedValues = JSON.parse(localStorage.getItem("storedValues")) || {};
      storedValues = {...storedValues, authorizations, currentAccess: accessUid};
      localStorage.setItem("storedValues", JSON.stringify(storedValues));

      const freshToken = getToken();
      const roleAuthorizations = await Habilitation.getHabilitationRole(freshToken, role.uid, true);
      storedValues = {...storedValues, role_authorizations: roleAuthorizations};
      localStorage.setItem("storedValues", JSON.stringify(storedValues));

      const lastVisitedPage = localStorage.getItem("lastVisitedPage");
      if (lastVisitedPage && !lastVisitedPage.includes("login")) {
        localStorage.removeItem("lastVisitedPage");
        router.push(lastVisitedPage);
      } else {
        router.push(DASHBOARD_PAGE);
      }
    } catch (error) {
      twoFaRef.current?.toggleLoader(false);
      setPageLoading(false);
      AuthService.formatFetchErrorMsgAndLogout(error.message, context, router);
    }
  };

  const roleLabels = UtilMethods.roleMatching(t);

  return (
    <div className={styles.page} data-simulation-header>
      <PageLoadingIndicator visible={pageLoading} />
      <SousHeader onBack={() => router.back()} />

      <main className={styles.main}>
        {access === null ? (
          <AccessesSelectionSkeleton />
        ) : (
          <motion.section
            className={styles.content}
            initial={reduceMotion ? false : {opacity: 0, y: 14}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: reduceMotion ? 0 : 0.45, ease: [0.22, 1, 0.36, 1]}}
            aria-labelledby="access-selection-title">
            <div className={styles.intro}>
              <span className={styles.eyebrow}>
                <LockOutlined aria-hidden="true" />
                {t("accessSelection.eyebrow")}
              </span>
              <p className={styles.welcome}>{t("accessSelection.welcome", {name})}</p>
              <h1 id="access-selection-title">{t("accessSelection.title")}</h1>
              <p className={styles.subtitle}>{t("accessSelection.subtitle")}</p>
            </div>

            {access.length > 0 ? (
              <div className={styles.grid}>
                {access.map((item, index) => {
                  const Icon = roleIcons[item.role.code] || Person;
                  const roleLabel = roleLabels[item.role.code] || item.role.label;
                  const description = t(`accessSelection.roles.${item.role.code}`, {
                    defaultValue: t("accessSelection.defaultRoleDescription"),
                  });

                  return (
                    <motion.button
                      type="button"
                      className={styles.card}
                      key={item.uid}
                      disabled={pageLoading}
                      onClick={() => handleRoleSelection(item)}
                      aria-label={t("accessSelection.continueAs", {role: roleLabel})}
                      initial={reduceMotion ? false : {opacity: 0, y: 12}}
                      animate={{opacity: 1, y: 0}}
                      transition={{
                        duration: reduceMotion ? 0 : 0.38,
                        delay: reduceMotion ? 0 : index * 0.05,
                      }}>
                      <span className={styles.iconBox}>
                        <Icon aria-hidden="true" />
                      </span>
                      <span className={styles.cardCopy}>
                        <strong>{roleLabel}</strong>
                        <span>{description}</span>
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              <div className={styles.emptyState}>
                <LockOutlined aria-hidden="true" />
                <p>{t("accessSelection.noAccess")}</p>
              </div>
            )}

            <div className={styles.securityNote}>
              <LockOutlined aria-hidden="true" />
              <p>{t("accessSelection.securityText")}</p>
            </div>
          </motion.section>
        )}
      </main>

      <TwoFAModal
        ref={twoFaRef}
        title={t("Two-Factor Authentification")}
        content={t("A Two-Factor OTP has been sent to you by email/sms.")}
        allowTrustDevice
        onCancel={() => setPageLoading(false)}
        onContinue={(otp, trustDevice) => handleRoleSelection(pendingData, otp, trustDevice)}
      />
    </div>
  );
};

export default AccessesSelection;
