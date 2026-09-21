import { z } from "zod";

// Helper function to get UUID
const getUUID = (val) => {
    if (!val) return null;
    if (typeof val === 'string') return val;
    return val.uid || null;
};

// Validation schema
const validationSchema = t => z.object({
    code: z.string().optional().nullable(),

    firstname: z.string().optional().nullable(),

    lastname: z.string().optional().nullable(),

    phone: z.string().nullable(),

    professional_email: z
        .string()
        .email({
            message: t("enterValidEmailAddress"),
        })
        .nullable(),

    adresse: z.string().optional().nullable(),

    gender: z.string().optional().nullable(),

    personal_email: z
        .string()
        .optional()
        .refine(
            (value) =>
                value === null ||
                value === undefined ||
                value === "" ||
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            {
                message: t("enterValidEmailOrLeaveEmpty"),
            }
        ).nullable(),

    provider_nature: z
        .preprocess(val => getUUID(val), z.string({
            required_error: t("selectContributorNature"),
            invalid_type_error: t("selectContributorNature"),
        })
        .uuid()
        .nonempty(t("selectContributorNature"))
    ),

    contractual_status: z
        .string({
            required_error: t("selectContractualStatus"),
        })
        .nonempty({
            message: t("selectContractualStatus"),
        }),

    animation_team: z
        .preprocess(val => getUUID(val), z.string().uuid())
        .optional()
        .nullable(),
});

export default validationSchema;
