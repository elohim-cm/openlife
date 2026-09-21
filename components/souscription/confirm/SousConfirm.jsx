"use client";
import React from "react";
import AppStep from "@/components/AppStepper/AppStep";
import {sous_img1, sous_img2, sous_img3} from "@/utils/assets/assets";
import AppStepper from "@/components/AppStepper";
import SousPaymentForm from "@/components/souscription/confirm/PaymentForm";
import SousConfirmForm from "@/components/souscription/confirm/ConfirmForm";
import {getUrlParams} from "@/utils";
import {useTranslation} from "react-i18next";

const SousConfirm = ({onSubmit, changeSideImage, token}) => {
  const {t} = useTranslation();
  const [currentStep, setCurrentStep] = React.useState(0);
  const [step1Data, setStep1Data] = React.useState(null);
  const [step2Data, setStep2Data] = React.useState(null);
  const stepper = React.useRef(null);

  React.useEffect(() => {
    const params = getUrlParams();
    params.forEach(item => {
      if (item.label === "tab") {
        if (parseInt(item.value) > 0) {
          stepper.current?.active(1);
        }
      }
    });
  }, []);

  const handleSubmit = _data => {
    onSubmit({
      confirm: step1Data,
      payment: step2Data ?? _data,
    });
  };

  const getSteps = () => {
    return [
      new AppStep(t("subscriptionConfirmationStep"), currentStep == 0, currentStep > 0, null),
      new AppStep(t("subscriptionPaymentStep"), currentStep == 1, currentStep > 1, null),
    ];
  };

  return (
    <div className="sous-form">
      <AppStepper
        ref={stepper}
        onStepTapped={_step => {
          setCurrentStep(_step);
        }}
        clickableStep={false}
        steps={getSteps()}>
        <SousConfirmForm
          token={token}
          onContinue={_data => {
            setStep1Data(_data);
            stepper.current.next();
            changeSideImage(sous_img3);
          }}
        />
        <SousPaymentForm
          token={token}
          onBack={() => {
            stepper.current.prev();
            changeSideImage(sous_img1);
          }}
          onContinue={_data => {
            setStep2Data(_data);
            changeSideImage(sous_img2);
            onSubmit(_data);
          }}
        />
      </AppStepper>
    </div>
  );
};

export default SousConfirm;
