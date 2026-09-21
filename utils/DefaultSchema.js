import {PhoneNumberUtil} from "google-libphonenumber";
import validate from "validate.js";
import Patterns from "@/utils/Patterns";

const phoneUtil = PhoneNumberUtil.getInstance();

export const isPhoneValid = phone => {
  try {
    return phone.match(Patterns.om) || phone.match(Patterns.mtn) ||
      phoneUtil.isValidNumber(phoneUtil.parseAndKeepRawInput(phone));
  } catch (error) {
    return false;
  }
};

const DefaultSchema = {
  required: {
    presence: {allowEmpty: false},
  },
  text: t => ({
    presence: true,
    length: {
      minimum: 2,
      tooShort: t("cantBeEmpty"),
    },
  }),
  select: t => ({
    presence: true,
    length: {
      minimum: 2,
      tooShort: t("pleaseSelectAnElement"),
    },
  }),
  name: {
    presence: true,
    format: {
      pattern: /((^([a-zA-Zçàéèï]{2,}\s)+[a-zA-Zçàéèï]{2,}$)|(^([a-zA-Zçàéèï]+)+[a-zA-Zçàéèï]+$))/,
      message: function (value, attribute, validatorOptions, attributes, globalOptions) {
        return validate.format("Must have at least 3 characters", {
          num: value,
        });
      },
    },
  },
  telephone: t => ({
    presence: true,
    format: {
      pattern: /((^6[0-9]{8}$)|(^(00|\+)?237(6[0-9]{8}$)))/,
      message: function (value, attribute, validatorOptions, attributes, globalOptions) {
        return validate.format(t("isNotAvalidPhoneNumber"), {
          num: value,
        });
      },
    },
  }),
  date: t => ({
    presence: true,
    format: {
      pattern: /^[0-9]{4}-[0-9]{2}-[0-9]{2}/,
      message: function (value, attribute, validatorOptions, attributes, globalOptions) {
        return validate.format(t("isNotAvalidDate"), {
          num: value,
        });
      },
    },
  }),
  file: {
    presence: true,
    type: value => {
      return value && value.name !== undefined;
    },
  },
  phone: t => ({
    presence: true,
    type: {
      type: value => {
        return isPhoneValid(value);
      },
      message: function (value, attribute, validatorOptions, attributes, globalOptions) {
        return validate.format(t("isNotAvalidPhoneNumber"), {
          num: value,
        });
      },
    },
  }),
  phoneOm: t => ({
    presence: true,
    type: {
      type: value => {
        return isPhoneValid(value) && value.match(Patterns.om);
      },
      message: function (value, attribute, validatorOptions, attributes, globalOptions) {
        return validate.format(t("isNotAvalidOmPhoneNumber"), {
          num: value,
        });
      },
    },
  }),
  phoneMtn: t => ({
    presence: true,
    type: {
      type: value => {
        return isPhoneValid(value) && value.match(Patterns.mtn);
      },
      message: function (value, attribute, validatorOptions, attributes, globalOptions) {
        return validate.format(t("isNotAvalidMomoPhoneNumber"), {
          num: value,
        });
      },
    },
  }),
  roleCode: t => ({
    presence: true,
    type: {
      type: value => {
        return value.match(Patterns.roleCode);
      },
      message: function (value, attribute, validatorOptions, attributes, globalOptions) {
        return validate.format(t("mustBeAtLeast4Letters"), {
          num: value,
        });
      },
    },
  }),
};

export default DefaultSchema;
