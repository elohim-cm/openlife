import {z} from "zod";
import Patterns from "@/utils/Patterns";

const getUUID = val => {
  if (!val) return null;
  if (typeof val === 'string') return val;
  return val.uid || null;
};

// validation schema
const validationSchema = t => z.object({
  code: z
    .string({
      required_error: t("youMustFillInContributorCodeField"),
    })
    .nonempty({
      message: t("youMustFillInContributorCodeField"),
    }),
  first_name: z
    .string({
      required_error: t("youMustFillInFirstNameField"),
    })
    .nonempty({
      message: t("firstNameCannotBeEmpty"),
    }),
  last_name: z
    .string({
      required_error: t("youMustFillInLastNameField"),
    })
    .nonempty({
      message: t("lastNameCannotBeEmpty"),
    }),
    phone: z.string().nonempty(t("phoneNumberCannotBeEmpty")),
    professional_email: z
    .string({
      required_error: t("youMustFillInProfessionalEmailField"),
    })
    .email({
      message: t("enterAValidEmail"),
    })
    .nonempty({
      message: t("professionalEmailCannotBeEmpty"),
    }),
    adresse: z.string().optional(),
    gender: z
    .string({
      required_error: t("chooseAGender"),
      invalid_type_error: t("chooseAGender"),
    })
    .nonempty(t("chooseAGender")),
    personal_email: z
        .string()
        .nullable()
        .refine((value) => {
            if (value === null || value === undefined || value === '') {
                return true; // Allow null or empty string
            }
            // Check for a valid email format using a basic regex
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
        }, {
            message: t("enterValidEmailOrLeaveEmpty"),
    }),
    provider_nature: z.preprocess(
    val => getUUID(val), z.string({
        required_error: t("selectContributorNature"),
        invalid_type_error: t("selectContributorNature"),
      })
      .nonempty(t("selectContributorNature"))
      .uuid(),
  ),
  contractual_status: z
    .string({
      required_error: t("selectContractualStatus"),
    })
    .nonempty({
      message: t("selectContractualStatus"),
    }),
  animation_team: z.preprocess(
    val => getUUID(val),z.string({
        required_error: t("selectAnimationTeam"),
        invalid_type_error: t("selectAnimationTeam"),
      })
      .nonempty(t("selectAnimationTeam"))
      .uuid(),
  ).optional().nullable(),
});

export default validationSchema;
