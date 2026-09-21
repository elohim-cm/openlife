import { z } from 'zod';

const getUuid= val => {
    return val?.uid || '';
};

const getName= val => {
    return val?.name || '';
}

const validationSchema = t => z.object({
    type: z.preprocess(val => getName(val), z.string().refine((value) => {
        const allowedTypes = ['network', 'distribution_area', 'animation_team', 'provider'];

        return value === null || allowedTypes.includes(value);
        }, { message: t("invalidType") })),

target: z.preprocess(val => getUuid(val), z.string({required_error: t('selectTarget')})),

value: z.string().refine((value) => {
    return (parseInt(value) !== null && value > 0);
        }, { message: t('enteredValueIsIncorrect') }),

nature: z.preprocess(val => getName(val), z.string().refine((value) => {
    const allowedNatures = ['collection', 'subscription'];
    return value === null || allowedNatures.includes(value);
        }, { message: t("invalidNature") })),

description: z.string().nullable(),

begin_date: z.string().nullable(),
end_date: z.string().nullable(),

parent: z.preprocess(val => getUuid(val), z.string().nullable().optional()),
});

export default validationSchema;
