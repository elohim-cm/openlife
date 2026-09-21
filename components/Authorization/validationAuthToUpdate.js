import { z } from "zod";

const getUUID = (val) => {
    let value = null;

    if (val) {
        value = val?.uid;
    }

    return value;
};

// schéma de validation
const validationAuthToUpdate = z.object({
    menu: z
        .preprocess(val => getUUID(val), z.string().uuid())
        .optional()
        .nullable(),
    role: z
        .preprocess(val => getUUID(val), z.string().uuid())
        .optional()
        .nullable(),
    permission: z
        .preprocess(val => getUUID(val), z.string().uuid())
        .optional()
        .nullable(),
});

export default validationAuthToUpdate;
