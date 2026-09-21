import { z } from 'zod'
import {
  emptyMenuErrorMessage,
  emptyPermissionErrorMessage,
  emptyRoleErrorMessage,
  requiredMenuErrorMessage,
  requiredPermissionErrorMessage,
  requiredRoleErrorMessage
} from "@/utils/literals/authorizationLiterals";
import { parse } from "stylis";

// validation schema
const createMenuValidationSchema = t => z.object({
  label: z.string({
    required_error: t("YouMustFillInLabelField"),
  }).nonempty({
    message: t("LabelCannotBeEmpty")
  }),
  /*url  : z.string({
    required_error: "Vous devez renseigner le champ url"
  }).nonempty({
    message: "Le champ url ne peut pas être vide"
  }).optional(),*/
  icon : z.string({
    required_error: t("YouMustFillInIconField")
  }).nonempty({
    message: t("IconCannotBeEmpty")
  }),
  group: z.preprocess(
    groupNumber => parseInt(z.string().parse(groupNumber), 10),
    z.number({
      required_error    : t("YouMustFillInGroupField"),
      invalid_type_error: t("GroupMustBeANumber")
    }).int().positive({
      message: t("GroupCannotBeNegativeNumber")
    }).min(1)
  ),
  order: z.preprocess(
    orderNumber => parseInt(z.string().parse(orderNumber), 10),
    z.number({
      required_error    : t("YouMustFillInOrderField"),
      invalid_type_error: t("OrderMustBeANumber")
    }).int().positive({
      message: t("OrderCannotBeNegativeNumber")
    }),
  )
})

export default createMenuValidationSchema