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
      required_error: t("YouMustFillInZoneCodeField"),
    })
    .nonempty({
      message: t("YouMustFillInZoneCodeField"),
    }),
  name: z
    .string({
      required_error: t("YouMustFillInZoneNameField"),
    })
    .nonempty({
      message: t("YouMustFillInZoneNameField"),
    }),
  manager: z
    .preprocess(val => getUUID(val), z.string().uuid().optional().nullable())
    .optional()
    .nullable(),
  reseau: z.preprocess(
    val => getUUID(val),
    z
      .string({
        invalid_type_error: t("YouMustSelectANetwork"),
        required_error: t("YouMustSelectANetwork"),
      })
      .uuid()
      .nonempty(t("YouMustSelectANetwork")),
  ),
  description: z.string().optional(),
});

export default validationSchema;
