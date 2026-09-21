import {z} from "zod";

const getUUID = val => {
  return val?.uid;
};

const schema = z.object({
  provider: z.preprocess(
    val => getUUID(val),
    z
      .string({
        invalid_type_error: "Vous devez choisir un apporteur",
        required_error: "Vous devez choisir un apporteur",
      })
      .uuid(),
    {
      invalid_type_error: "Vous devez choisir un apporteur",
      required_error: "Vous devez choisir un apporteur",
    },
  ),
});

export default schema;
