import {z} from "zod";

const getUUID = val => {
    let value = null;

    if (val) {
        value = val?.uid;
    }

    return value;
};

// validation schema
const validationSchema = t => z.object({
    code: z
    .string({
        required_error: t("networkCodeRequired"),
    })
    .nonempty({
        message: t("networkCodeRequired"),
    }),
    name: z
        .string({
            required_error:t("networkNameRequired"),
        })
        .nonempty({
            message: t("networkNameRequired"),
        }),
    parent: z.preprocess(val => getUUID(val), z.string().uuid().optional().nullable()),
    inspector: z.preprocess(val => getUUID(val), z.string().uuid().optional().nullable()),
    description: z.string().optional().nullable(),
});

export default validationSchema;
