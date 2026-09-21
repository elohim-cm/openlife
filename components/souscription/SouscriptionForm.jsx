"use client";

import React, {useCallback} from "react";
import AppStep from "@/components/AppStepper/AppStep";
import AppStepper from "@/components/AppStepper";
import SousFormStep1 from "@/components/souscription/forms/step1";
import SousFormStep2 from "@/components/souscription/forms/step2";
import SousFormStep3 from "@/components/souscription/forms/step3";
import SousFormStep4 from "@/components/souscription/forms/step4";
import {sous_img1, sous_img2, sous_img3} from "@/utils/assets/assets";
import ActivityIndicator from "@/components/ActivityIndicator";
import {Skeleton, Stack} from "@mui/material";
import Grid from "@mui/material/Unstable_Grid2";
import SubscriptionService from "@/services/SubscriptionService";
import useStateCallback from "@/utils/use_state";
import {
  arrayRemoveItem,
  DateDiff,
  getFileName,
  getMoiMemeFiliation,
  getRoleCode,
  getToken,
  getUrlParams,
  sleep,
} from "@/utils";
import Constants from "@/utils/constants";
import UserService from "@/services/UserService";
import UserWalletService from "@/services/UserWalletService";
import {displayHttpError} from "@/utils/api";
import {useRouter} from "next/navigation";
import {useTranslation} from "react-i18next";
import UtilMethods from "@/utils/UtilMethods";
import ContractModel from "@/models/Contract";

const SousFormSkeleton = () => {
  return (
    <Stack spacing={1}>
      <Skeleton variant="text" sx={{fontSize: "3rem"}} />
      <Grid container spacing={2} sx={{mt: 0}}>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rectangular" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
        <Grid xs={12} md={6} lg={6} xl={6}>
          <Skeleton variant="rounded" height={60} />
        </Grid>
      </Grid>
    </Stack>
  );
};
/**
 *
 * @param onSubmit
 * @param changeSideImage
 * @param token
 * @param data {SubscriptionModel}
 * @param onSubscribe
 * @param updating
 * @param parentReady
 * @param updating
 * @param parentReady
 * @param isContract
 * @param dataModifyBySubscriber
 * @param dueDate
 * @param ref
 * @returns {Element}
 * @constructor
 */
const SouscriptionForm = (
  {
    onSubmit,
    changeSideImage,
    token,
    data,
    onSubscribe,
    updating = false,
    parentReady = true,
    isContract = false,
    dataModifyBySubscriber = null,
    dueDate = null,
    _statuses = [],
    _status = null,
  },
  ref,
) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [dateDue, setDateDue] = React.useState(dueDate);
  const [status, setStatus] = React.useState(_status);
  const [step1Data, setStep1Data] = React.useState({});
  const [step2Data, setStep2Data] = React.useState([]);
  const [step3Data, setStep3Data] = React.useState([]);
  const [step4Data, setStep4Data] = useStateCallback([]);
  const [genders, setGenders] = React.useState([]);
  const [filiations, setFiliations] = React.useState([]);
  const [situations, setSituations] = React.useState([]);
  const [persons, setPersons] = React.useState([]);
  const stepper = React.useRef(null);
  const [inProgress, setInProgress] = React.useState(false);
  const [ready, setReady] = React.useState(false);
  const router = useRouter();
  const {t} = useTranslation();

  React.useImperativeHandle(ref, () => ({
    showLoader: () => {
      setInProgress(true);
    },
    hideLoader: () => {
      setInProgress(false);
    },
  }));

  const postInit = useCallback(async _filiations => {
    if (isSubscriber() && !updating) {
      const result = await UserService.get();
      if (result.error == null) {
        const item = result.data;
        const data = {
          situation: item.marital_status ? item.marital_status.uid : "",
          sexe: item.gender ? item.gender.uid : "",
          name: item.last_name,
          firstname: item.first_name,
          phone1: item.main_phone,
          phone2: item.secondary_phone,
          birthplace: item.birth_place,
          birthdate: item.birth_date,
          residence: item.address,
          email: item.email,
          niu: item.niu_number,
          cni: item.cni_number,
          expirationCni: item.cni_expired_at,
        };

        let params = getUrlParams();
        if (!isContract) {
          params.forEach(item => {
            if (item.label === "prime") data.prime = item.value;
            if (item.label === "duration") data.duration = item.value;
          });
        }
        /*else{
          data.prime = dataModifyBySubscriber.prime
          data.duration = dataModifyBySubscriber.duration
        }*/

        const filiation = _filiations.filter(item => item.label === "Moi-même")[0];
        const benef = {
          filiation: filiation.uid,
          filiationLabel: filiation.label,
          ...data,
        };
        setStep2Data([benef]);
        setStep1Data(data);
        const difference = DateDiff.inDays(new Date(item.cni_expired_at), new Date());
        if (difference > 0) {
          setCurrentStep(1);
        }
      }
    } else {
      if (getToken() != null && !updating) {
        const result = await UserWalletService.get(token);
        if (result.error == null) {
          if (result.data.length) {
            const tab = result.data.map(item => ({
              situation: item.marital_status ? item.marital_status.uid : "",
              sexe: item.gender ? item.gender.uid : "",
              name: item.last_name,
              firstname: item.first_name,
              phone1: item.main_phone,
              phone2: item.secondary_phone,
              birthplace: item.birth_place,
              birthdate: item.birth_date,
              residence: item.address,
              email: item.email,
              niu: item.niu_number,
              cni: item.cni_number,
              has_accept_conditions: item.has_accept_conditions,
              expirationCni: item.cni_expired_at,
              uid: item.uid,
            }));
            setPersons(tab);
          }
        } else {
          displayHttpError(result.error, router);
        }
      }
    }
  }, []);

  const initForm = React.useCallback(() => {
    console.log("Data::: ", data);
    if (data) {
      setStep1Data({
        duration: dataModifyBySubscriber?.duration || data.duration,
        prime: dataModifyBySubscriber?.prime || data.prime,
        firstname: data.subscribers[0].person.first_name,
        name: data.subscribers[0].person.last_name,
        email: data.subscribers[0].person.email,
        phone1: data.subscribers[0].person.main_phone,
        phone2: data.subscribers[0].person.secondary_phone,
        birthdate: data.subscribers[0].person.birth_date,
        birthplace: data.subscribers[0].person.birth_place,
        residence: data.subscribers[0].person.address,
        niu: data.subscribers[0].person.nui_number,
        cni: data.subscribers[0].person.cni_number,
        expirationCni: data.subscribers[0].person.cni_expired_at,
        situation: data.subscribers[0].person.marital_status ? data.subscribers[0].person.marital_status.uid : "",
        sexe: data.subscribers[0].person.gender ? data.subscribers[0].person.gender.uid : "",
        //scanCni1: getFileName(data.cni_file_main),
        //scanCni2: getFileName(data.cni_file_secondary),
      });
      setStep2Data(
        data.life_beneficiaries.map(item => ({
          uid: item.person.uid,
          filiation: item.affiliation ? item.affiliation.uid : getMoiMemeFiliation(filiations),
          filiationLabel: item.affiliation ? item.affiliation.label : "Moi-même",
          firstname: item.person.first_name,
          name: item.person.last_name,
          email: item.person.email,
          phone1: item.person.main_phone,
          birthdate: item.person.birth_date,
          birthplace: item.person.birth_place,
          residence: item.person.address,
        })),
      );
      setStep3Data(
        data.death_beneficiaries.map(item => ({
          uid: item.person.uid,
          filiation: item.affiliation ? item.affiliation.uid : "",
          filiationLabel: item.affiliation ? item.affiliation.label : "",
          death_beneficiary_uid: item?.person?.uid ?? '',
          firstname: item.person.first_name,
          name: item.person.last_name,
          email: item.person.email,
          phone1: item.person.main_phone,
          birthdate: item.person.birth_date,
          birthplace: item.person.birth_place,
          residence: item.person.address,
        })),
      );
      setStep4Data(
        data.person_contacts.map(item => ({
          uid: item.person.uid,
          filiation: item.affiliation ? item.affiliation.uid : "",
          filiationLabel: item.affiliation ? item.affiliation.label : "",
          person_contact_uid: item?.person?.uid ?? '',
          firstname: item.person.first_name,
          name: item.person.last_name,
          email: item.person.email,
          phone1: item.person.main_phone,
          birthdate: item.person.birth_date,
          birthplace: item.person.birth_place,
          residence: item.person.address,
        })),
      );
    }
  }, [data]);

  const getDatas = useCallback(async () => {
    let gendersData = await SubscriptionService.getGender(token);
    let filiationsData = await SubscriptionService.getFilitation(token);
    let situationsData = await SubscriptionService.getSituation(token);
    if (!gendersData.error) setGenders(gendersData.data.map(item => ({...item, value: item.uid})));
    if (!filiationsData.error) setFiliations(filiationsData.data.map(item => ({...item, value: item.uid})));
    if (!situationsData.error) setSituations(situationsData.data.map(item => ({...item, value: item.uid})));
    initForm();
    await postInit(filiationsData.data);
    setReady(true);
  }, [initForm, postInit, token]);

  React.useEffect(() => {
    if (localStorage.getItem("personHasAcceptCondition") !== null) {
      localStorage.removeItem("personHasAcceptCondition");
    }
    getDatas();
  }, [getDatas]);

  const isSubscriber = () => {
    return getToken() != null && getRoleCode() === Constants.ROLES.sous;
  };

  const handleSubmit = (_data, _draft = 0, _subscribe = false) => {
    console.log("Step1::: ", step1Data);
    console.log("Step2::: ", step2Data);
    console.log("Step3::: ", step3Data);
    console.log("Step4::: ", step4Data, _data);

    let sousData = {
      duration: step1Data.duration,
      prime: step1Data.prime,
      type_signature: "9a13ed88-1663-4b1f-8cd8-6ef12e6e4662",
      draft: _draft,
      is_not_subscriber: isSubscriber() ? 0 : 1,
      due_date: dateDue,
      ...(UtilMethods.isCustomerService() && status && {contract_status: status.value}),
      subscriber: [
        {
          first_name: step1Data.firstname,
          last_name: step1Data.name,
          email: step1Data.email,
          main_phone: step1Data.phone1,
          secondary_phone: step1Data.phone2,
          birth_day: step1Data.birthdate,
          birth_place: step1Data.birthplace,
          address: step1Data.residence,
          niu_number: step1Data.niu,
          cni_number: step1Data.cni,
          cni_expired_date: step1Data.expirationCni,
          marital_status: step1Data.situation,
          gender: step1Data.sexe,
        },
      ],
      life_beneficiary: step2Data.map(item => ({
        uid: item.uid ?? '',
        affiliation: item.filiation,
        affiliationLabel: item.filiationLabel,
        first_name: item.firstname,
        last_name: item.name,
        email: item.email,
        phone: item.phone1,
        birth_day: item.birthdate,
        birth_place: item.birthplace,
        address: item.residence ?? "",
      })),
      death_beneficiary: step3Data.map(item => ({
        uid: item.uid ?? '',
        affiliation: item.filiation,
        death_beneficiary_uid: item?.death_beneficiary_uid ?? '',
        first_name: item.firstname,
        last_name: item.name,
        email: item.email,
        phone: item.phone1,
        birth_day: item.birthdate,
        birth_place: item.birthplace,
        address: item.residence ?? "",
      })),
      person_contact: (step4Data ?? _data).map(item => ({
        uid: item.uid ?? '',
        affiliation: item.filiation,
        person_contact_uid: item?.person_contact_uid ?? '',
        first_name: item.firstname,
        last_name: item.name,
        email: item.email,
        phone: item.phone1,
        birth_day: item.birthdate ?? "",
        birth_place: item.birthplace ?? "",
        address: item.residence ?? "",
      })),
    };

    if (step1Data.cniFile1 != null) {
      if (step1Data.cniFile2 != null) {
        sousData.scan_cni = [step1Data.cniFile1, step1Data.cniFile2];
      } else {
        sousData.scan_cni = [step1Data.cniFile1];
      }
    }
    console.log('ON COMPNONENT FORM');
    console.log(sousData)
    if (sousData.life_beneficiary.length) {
      if (sousData.life_beneficiary[0].affiliationLabel === "Moi-même") delete sousData.life_beneficiary;
    } else delete sousData.life_beneficiary;
    if (_subscribe && data !== undefined && data != null && data.status.toLowerCase() === "draft") {
      onSubscribe(sousData);
    } else {
      onSubmit(sousData);
    }
  };

  const getSteps = () => {
    return [
      new AppStep(t("subscriberInformation"), currentStep === 0, currentStep > 0, null),
      new AppStep(t("deathBeneficiary"), currentStep === 1, currentStep > 1, null),
      new AppStep(t("contactInCaseOfDeath"), currentStep === 2, currentStep > 2, null),
    ];
  };

  return (
    <div className="sous-form">
      <ActivityIndicator visible={inProgress} />
      {parentReady && ready ? (
        <AppStepper
          ref={stepper}
          persistentLabel={false}
          onStepTapped={_step => {
            setCurrentStep(_step);
          }}
          steps={getSteps()}>
          <SousFormStep1
            situationsTab={situations}
            gendersTab={genders}
            personsTab={persons}
            data={step1Data}
            updating={updating}
            isContract={isContract}
            dueDate={dateDue}
            onHandleChangeDueDate={setDateDue}
            ctr_status={status}
            onHandleChangeCtrStatus={setStatus}
            __statuses={_statuses}
            onContinue={_data => {
              setStep1Data(_data);
              stepper.current.next();
              changeSideImage(sous_img3);
              const filiation = filiations.filter(item => item.label === "Moi-même")[0];
              const benef = {
                filiation: filiation.uid,
                filiationLabel: filiation.label,
                ..._data,
              };
              setStep2Data([benef]);
            }}
          />
          <SousFormStep3
            filiationsTab={arrayRemoveItem(filiations, "label", "Moi-même")}
            data={step3Data}
            isContract={isContract}
            onBack={() => {
              stepper.current.prev();
              changeSideImage(sous_img3);
            }}
            onContinue={_data => {
              setStep3Data(_data);
              stepper.current.next();
              changeSideImage(sous_img2);
            }}
          />
          <SousFormStep4
            filiationsTab={arrayRemoveItem(filiations, "label", "Moi-même")}
            data={step4Data}
            updating={updating}
            isContract={isContract}
            editing={data !== undefined && data != null}
            isDraft={data !== undefined && data != null && data.status.toLowerCase() === "draft"}
            onSaveAsDraft={_data => {
              console.log("Saved as draft::: ", _data);
              handleSubmit(_data, 1);
            }}
            onBack={() => {
              stepper.current.prev();
              changeSideImage(sous_img1);
            }}
            onContinue={(_data, _subscribe = false) => {
              handleSubmit(_data, 0, _subscribe);
            }}
          />
        </AppStepper>
      ) : (
        <SousFormSkeleton />
      )}
    </div>
  );
};

export default React.forwardRef(SouscriptionForm);
