import { z } from 'zod';

const accessCreateValidationSchema = (isAdminRole, t) => {
    return z.object({
        account: z.string({
            required_error: t("YouMustFillInAccountField"),
        }).nonempty({
            message: t("AccountCannotBeEmpty"),
        }),
        role: z.string({
            required_error: t("YouMustSelectARole")
        }).nonempty({
            message: t("RoleCannotBeEmpty")
        }),
        status: z.string({
            required_error: t("YouMustFillInStatusField")
        }).nonempty({
            message: t("StatusCannotBeEmpty")
        }),
        code: isAdminRole
            ? z.string()
            : z.string({
                required_error: t("YouMustFillInCodeField"),
            })
                .nonempty({
                    message: t("CodeCannotBeEmpty"),
                })
                .refine((data) => data.trim() !== "", {
                    message: t("CodeCannotBeEmpty"),
                }),
    });
};

export default accessCreateValidationSchema;
