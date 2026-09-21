import {z} from "zod";

const schema = t => z.object({
  phone: z.string().nonempty(t("phoneNumberCannotBeEmpty")),
  amount: z
    .number({required_error: t("youMustFillInAmountField")})
    .min(200, t("minimumCollectionAmountIs200FCFA"))
    .max(100000, t("maximumCollectionAmountIs100000FCFA"))
    .or(z.string().regex(/\d+/).transform(Number))
    .refine(n => n >= 0),
  payment_method: z
    .string({
      required_error: t("paymentMethodIsRequired"),
      invalid_type_error: t("paymentMethodIsRequired"),
    })
    .nonempty(t("paymentMethodIsRequired")),
  payment_system: z
    .string({
      required_error: t("paymentSystemIsRequired"),
      invalid_type_error: t("paymentSystemIsRequired"),
    })
    .nonempty(t("paymentSystemIsRequired")),
  contract: z
    .string({
      required_error: t("contractIsRequired"),
      invalid_type_error: t("contractIsRequired"),
    })
    .nonempty(t("contractIsRequired")),
});

export default schema;
