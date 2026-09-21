import { z } from 'zod'
import {
  emptyMenuErrorMessage,
  emptyPermissionErrorMessage,
  emptyRoleErrorMessage,
  requiredMenuErrorMessage,
  requiredPermissionErrorMessage,
  requiredRoleErrorMessage
} from "@/utils/literals/authorizationLiterals";

// validation schema
const authorizationCreateValidationSchema = t => z.object({
  menu      : z.string({
    required_error: emptyMenuErrorMessage(t),
  }).nonempty({
    message: requiredMenuErrorMessage(t)
  }),
  role      : z.string({
    required_error: requiredRoleErrorMessage(t)
  }).nonempty({
    message: emptyRoleErrorMessage(t)
  }),
  permission: z.string({
    required_error: requiredPermissionErrorMessage(t)
  }).nonempty({
    message: emptyPermissionErrorMessage(t)
  }),
})

export default authorizationCreateValidationSchema