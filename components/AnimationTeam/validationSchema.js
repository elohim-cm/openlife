import {z} from "zod";

const getUUID = val => {
  let value = null;

  if (val) {
    value = val?.uid;
  }

  return value;
};

/**
 *
 * @param  t
 * @return {ZodObject<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}, "strip", ZodTypeAny, {[k_1 in keyof objectUtil.addQuestionMarks<baseObjectOutputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>, {[k in keyof baseObjectOutputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>]: undefined extends baseObjectOutputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>[k] ? never : k}[keyof {code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}]>]: objectUtil.addQuestionMarks<baseObjectOutputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>, {[k in keyof baseObjectOutputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>]: undefined extends baseObjectOutputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>[k] ? never : k}[keyof {code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}]>[k_1]}, {[k_2 in keyof baseObjectInputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>]: baseObjectInputType<{code: ZodString, name: ZodString, distribution_area: ZodEffects<ZodString, ZodString["_output"], unknown>, description: ZodNullable<ZodOptional<ZodString>>, animator: ZodEffects<ZodNullable<ZodOptional<ZodString>>, ZodNullable<ZodOptional<ZodString>>["_output"], unknown>}>[k_2]}>}
 */
const validationSchema = t => z.object({
  code: z
    .string({required_error: t("youMustFillInTheCodeFieldForTheAnimationTeam")})
    .nonempty(t("youMustFillInTheCodeFieldForTheAnimationTeam")),
  name: z
    .string({
      required_error: t("youMustFillInTheNameField"),
    })
    .nonempty({
      message: t("youMustFillInTheNameField"),
    }),
  animator: z.preprocess(val => getUUID(val), z.string().uuid().optional().nullable()),
  distribution_area: z.preprocess(
    val => getUUID(val),
    z
      .string({
        required_error: t("youMustSelectTheDistributionArea"),
        invalid_type_error: t("youMustSelectTheDistributionArea"),
      })
      .uuid()
      .nonempty(t("youMustSelectTheDistributionArea")),
  ),
  description: z.string().optional().nullable(),
});

export default validationSchema;
