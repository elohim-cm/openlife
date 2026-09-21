"use client";

import React from "react";
import "@/styles/stepper.scss";
import Tooltip from "@mui/material/Tooltip";
import {AnimatePresence, motion, useReducedMotion} from "framer-motion";

/**
 *
 * @param steps {AppStep[]}
 * @param onStepTapped
 * @param clickableStep
 * @param persistentLabel
 * @param children
 * @param ref
 * @returns {Element}
 * @constructor
 */
const AppStepper = ({steps, onStepTapped, clickableStep = true, persistentLabel = true, ...props}, ref) => {
  const [currentStep, setCurrentStep] = React.useState(0);
  const [appSteps, setAppSteps] = React.useState(steps);
  const [direction, setDirection] = React.useState(1);
  const reduceMotion = useReducedMotion();
  const navRef = React.useRef(null);

  React.useEffect(() => {
    setAppSteps(currentSteps =>
      currentSteps.map((currentStepItem, index) => ({
        ...currentStepItem,
        title: steps[index]?.title ?? currentStepItem.title,
      })),
    );
  }, [steps]);

  React.useImperativeHandle(ref, () => ({
    next: next,
    prev: prev,
    active: active,
  }));

  const scrollToStepStart = () => {
    window.requestAnimationFrame(() => {
      const nav = navRef.current;
      const scrollController = nav?.closest(".sous-scroll-controller");
      if (!nav || !scrollController) return;

      const headerHeight = scrollController.querySelector(".sous-header")?.offsetHeight ?? 0;
      const top = scrollController.scrollTop
        + nav.getBoundingClientRect().top
        - scrollController.getBoundingClientRect().top
        - headerHeight
        - 16;

      scrollController.scrollTo({
        top: Math.max(0, top),
        behavior: reduceMotion ? "auto" : "smooth",
      });
    });
  };

  const next = () => {
    if (currentStep < steps.length - 1) {
      const nextStep = currentStep + 1;
      setDirection(1);
      setAppSteps(currentSteps => currentSteps.map((item, index) => ({
        ...item,
        isActive: index === nextStep,
        completed: index === currentStep ? true : item.completed,
      })));
      setCurrentStep(nextStep);
      scrollToStepStart();
    } else throw new Error("Error cannot continue. This is the last step.");
  };
  const prev = () => {
    if (currentStep > 0) {
      active(currentStep - 1);
    } else throw new Error("Error cannot back. This is the first step");
  };

  const active = _index => {
    if (_index < steps.length) {
      setDirection(_index >= currentStep ? 1 : -1);
      setAppSteps(currentSteps => currentSteps.map((item, index) => ({
        ...item,
        isActive: index === _index,
      })));
      setCurrentStep(_index);
      scrollToStepStart();
    } else throw new Error("Error cannot find the step index");
  };

  return (
    <div className="__stepper">
      <motion.div ref={navRef} className="__stepper-nav" layout>
        {appSteps.map((item, index) => (
          <motion.div
            key={index}
            layout="position"
            className={item.isActive ? "active" : ""}
            animate={reduceMotion ? undefined : {
              opacity: item.isActive ? 1 : .7,
            }}
            transition={{
              duration: reduceMotion ? 0 : .42,
              ease: [0.4, 0, 0.2, 1],
              layout: {duration: reduceMotion ? 0 : .42, ease: [0.4, 0, 0.2, 1]},
            }}
            onClick={() => {
              if (clickableStep) active(index);
            }}>
            <motion.div
              className="__icon"
              layout="position"
              animate={reduceMotion ? undefined : {scale: item.isActive ? [1, 1.12, 1] : 1}}
              transition={{duration: reduceMotion ? 0 : .42, ease: [0.4, 0, 0.2, 1]}}
            >
              {index + 1}
            </motion.div>
            <AnimatePresence initial={false}>
              {item.isActive || persistentLabel ? (
                <motion.div
                  key={`step-title-${index}`}
                  layout="position"
                  className="__stepper-label-shell"
                  initial={reduceMotion ? false : {opacity: 0}}
                  animate={{opacity: 1}}
                  exit={reduceMotion ? undefined : {opacity: 0}}
                  transition={{duration: reduceMotion ? 0 : .3, ease: [0.4, 0, 0.2, 1]}}
                >
                  <Tooltip title={item.title}>
                    <div className="__text">{item.title}</div>
                  </Tooltip>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        ))}
      </motion.div>
      <div className={`__stepper-view ${direction > 0 ? "direction-forward" : "direction-backward"}`}>
        {props.children.map((item, index) => (
          <motion.div
            key={index}
            className={appSteps[index].isActive ? "active" : ""}
            aria-hidden={!appSteps[index].isActive}
            inert={appSteps[index].isActive ? undefined : ""}
            initial={false}
            animate={appSteps[index].isActive ? {
              opacity: 1,
              x: 0,
            } : {
              opacity: 0,
              x: reduceMotion ? 0 : direction * -14,
            }}
            transition={{duration: reduceMotion ? 0 : .42, ease: [0.4, 0, 0.2, 1]}}
          >
            {item}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default React.forwardRef(AppStepper);
