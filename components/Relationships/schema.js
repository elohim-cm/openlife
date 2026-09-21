import { z } from "zod";

/*const schema = z.object({
    subscriber: z.array(
        z.object({
            first_name: z.optional(),
            last_name: z.optional(),
            email: z.optional(),
            main_phone: z.optional(),
            secondary_phone: z.optional(),
            birth_day: z.date().optional(),
            birth_place: z.optional(),
            address: z.optional(),
            niu_number: z.optional(),
            cni_number: z.optional(),
            cni_expired_date: z.date().optional(),
            marital_status: z.optional(),
            gender: z.optional(),
        })
    ),
});*/

const getUUID = val => {
        let value = null;

        if (val) {
                value = val?.uid;
        }

        return value;
};

// validation schema
const schema = t => z.object({
        first_name : z.string().min(2).max(255)
            .refine((value) => /^[A-Za-zÀ-ÿ0-9]{2,}[A-Za-zÀ-ÿ0-9\s!@#$%^&*()\-_+={}[\]:;"\',.]+$/.test(value), {
                    message: 'Le prénom doit respecter le format spécifié.'
            }).optional(),
        last_name : z.string().min(2).max(255)
            .refine((value) => /^[A-Za-zÀ-ÿ0-9]{2,}[A-Za-zÀ-ÿ0-9\s!@#$%^&*()\-_+={}[\]:;"\',.]+$/.test(value), {
                    message: 'Le prénom doit respecter le format spécifié.'
            }).optional(),
        email : z.string().email('La valeur entre doit etre un email').optional(),
        main_phone : z.string().optional(),
        secondary_phone : z.string().optional(),
        birth_day : z.string().optional(),
        birth_place : z.string().max(255)
            .refine((value) => /^[A-Za-zÀ-ÿ0-9]{2,}[A-Za-zÀ-ÿ0-9\s!@#$%^&*()\-_+={}[\]:;"\',.]+$/.test(value), {
                    message: 'Le lieu de naissance doit respecter le format spécifié.'
            }).optional(),
        address : z.string().max(255)
            .refine((value) => /^[A-Za-zÀ-ÿ0-9]{2,}[A-Za-zÀ-ÿ0-9\s!@#$%^&*()\-_+={}[\]:;"\',.]+$/.test(value), {
                message: 'L\'adresse doit respecter le format spécifié.'
            }).optional(),
        niu_number : z.string().optional(),
        cni_number : z.string().optional(),
        cni_expired_date : z.string().optional(),
        marital_status : z.preprocess(val => getUUID(val), z.string().uuid().optional().nullable()).optional()
            .nullable(),
        gender : z.string().nullable(),
});

export default schema;
