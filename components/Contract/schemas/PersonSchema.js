import {z} from "zod";

const getUUID = val => {
  return val?.uid;
};

const schema = z.object({
  affiliation: z.preprocess(
    val => getUUID(val),
    z
      .string({
        required_error: "Vous devez choisir une affiliation",
        invalid_type_error: "Vous devez choisir une affiliation",
      })
      .uuid(),
  ),
  first_name: z
    .string({
      required_error: "Vous devez renseigner le Prénom",
      invalid_type_error: "Vous devez renseigner le Prénom",
    })
    .nonempty("Vous devez renseigner le Prénom")
    .optional(),
  last_name: z
    .string({
      required_error: "Vous devez renseigner le Nom",
      invalid_type_error: "Vous devez renseigner le Nom",
    })
    .nonempty("Vous devez renseigner le Nom")
    .optional(),
  email: z
    .string({
      required_error: "Vous devez renseigner l'adresse e-mail",
      invalid_type_error: "Vous devez renseigner l'adresse e-mail",
    })
    .email("Veuillez saisir une adresse e-mail valide")
    .nonempty("Vous devez renseigner l'adresse e-mail")
    .optional(),
  phone: z
    .string({
      required_error: "Vous devez renseigner le Numéro de téléphone",
      invalid_type_error: "Vous devez renseigner le Numéro de téléphone",
    })
    .min(9, "Le numéro de téléphone doit avoir au moins 9 chiffres")
    .max(12, "le numéro de téléphone ne doit pas dépasser 12 chiffres")
    .nonempty("Vous devez renseigner le Numéro de téléphone")
    .optional(),
  birth_date: z.coerce
    .date({
      required_error: "Vous devez renseigner la date de naissance",
      invalid_type_error: "Vous devez renseigner la date de naissance",
    })
    .max(new Date(), "Vous ne pouvez pas renseigner une date du futur"),
  birth_place: z
    .string({
      required_error: "Vous devez renseigner le lieu de naissance",
      invalid_type_error: "Vous devez renseigner le lieu de naissance",
    })
    .datetime()
    .nonempty("Vous devez renseigner le lieu de naissance")
    .optional(),
  address: z
    .string({
      required_error: "Vous devez renseigner l'Adresse",
      invalid_type_error: "Vous devez renseigner l'Adresse",
    })
    .nonempty("Vous devez renseigner l'Adresse")
    .optional(),
});

export default schema;
