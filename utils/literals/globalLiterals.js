/* This file contains all the string literals used in form validations and other places in the app */

// empty password error message
export const emptyPasswordMessage = t => t("missingPassword")

// incorrect password error message
export const incorrectPasswordMessage = t => t("requirements")

// min password length
export const minPassworLengthdMessage = t => t("passwordLength")

// empty confirm password error message
export const emptyConfirmPasswordMessage = t => t("missingPasswordConfirmation");

// empty username error message
export const emptyUsernameMessage = t => t("missingUserId");

// empty reset password token error message
export const emptyPasswordResetTokenMessage = t => t("missingConfirmationCode");

// password don't match error message
export const passwordDontMatchMessage = t => t("passwordsNotMatch");

// password invalid type error message
export const passwordInvalidTypeMessage = t => t("incorrectPassword");

// email invalid type error message
export const emailInvalidTypeMessage = t => t("incorrectEmail");

// email empty type error message
export const emptyEmailErrorMessage = t => t("missingEmail");

// first name invalid type error message
export const firstNameInvalidTypeErrorMessage = t => t("missingLastName");

// last name invalid type error message
export const LastNameInvalidTypeErrorMessage = t => t("missingFirstName");

// first name invalid type error message
export const emptyFirstNameErrorMessage = t => t("duplicateFirstName");

// last name invalid type error message
export const emptyLastNameErrorMessage = t => t("duplicateLastName");

// phone number empty error message
export const emptyPhoneNumberErrorMessage = t => t("missingPhoneNumber");

// invalid phone number error message
export const invalidPhoneNumberErrorMessage = t => t("invalidPhoneNumber");

// max phone number error message
export const maxPhoneNumberErrorMessage = t => t("phoneNumberTooLong");

// min phone number error message
export const minPhoneNumberErrorMessage = t => t("phoneNumberMinLength");