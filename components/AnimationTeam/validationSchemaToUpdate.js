import { z } from "zod";

const getUUID = (val) => {
    let value = null;

    if (val) {
        value = val?.uid;
    }

    return value;
};

// schéma de validation
const validationSchemaToUpdate = z.object({
    code: z.string().optional().nullable(),
    name: z.string().optional().nullable(),
    animator: z
        .preprocess(val => getUUID(val), z.string().uuid())
        .optional()
        .nullable(),
    distribution_area: z
        .preprocess(val => getUUID(val), z.string().uuid())
        .optional()
        .nullable(),
    description: z.string().optional().nullable(),
});

export default validationSchemaToUpdate
