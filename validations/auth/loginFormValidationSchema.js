import { z } from "zod";
import {
    emptyPasswordMessage,
    emptyUsernameMessage, incorrectPasswordMessage, minPassworLengthdMessage,
    passwordInvalidTypeMessage
} from "@/utils/literals/globalLiterals";

// form validation schema
const loginValidationSchema = z.object({
    username: z.string().nonempty({ message: emptyUsernameMessage }),
    password: z.string({ invalid_type_error: passwordInvalidTypeMessage })
             .nonempty({ message: emptyPasswordMessage })
             .min(6, minPassworLengthdMessage)
             .regex(/^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9]).{6,}$/, incorrectPasswordMessage),
})

export default loginValidationSchema