import {z} from "zod";

const getUUID = val => {
  return val?.uid;
};

const schema = z.object({
  first_name: z
    .string({
      required_error: "Vous devez renseigner le Prénom",
      invalid_type_error: "Vous devez renseigner le Prénom",
    })
    .nonempty("Vous devez renseigner le Prénom"),
  last_name: z
    .string({
      required_error: "Vous devez renseigner le Nom",
      invalid_type_error: "Vous devez renseigner le Nom",
    })
    .nonempty("Vous devez renseigner le Nom"),
  email: z
    .string({
      required_error: "Vous devez renseigner l'adresse e-mail",
      invalid_type_error: "Vous devez renseigner l'adresse e-mail",
    })
    .email("Veuillez saisir une adresse e-mail valide")
    .nonempty("Vous devez renseigner l'adresse e-mail"),
  main_phone: z
    .string({
      required_error: "Vous devez renseigner le Numéro de téléphone principal",
      invalid_type_error: "Vous devez renseigner le Numéro de téléphone principal",
    })
    .min(9, "Le numéro de téléphone doit avoir au moins 9 chiffres")
    .max(12, "le numéro de téléphone ne doit pas dépasser 12 chiffres")
    .nonempty("Vous devez renseigner le Numéro de téléphone principal"),
  secondary_phone: z
    .string({
      required_error: "Vous devez renseigner le Numéro de téléphone secondaire",
      invalid_type_error: "Vous devez renseigner le Numéro de téléphone secondaire",
    })
    .min(9, "Le numéro de téléphone doit avoir au moins 9 chiffres")
    .max(12, "le numéro de téléphone ne doit pas dépasser 12 chiffres")
    .nonempty("Vous devez renseigner le Numéro de téléphone secondaire"),
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
    .nonempty("Vous devez renseigner le lieu de naissance"),
  address: z
    .string({
      required_error: "Vous devez renseigner l'Adresse",
      invalid_type_error: "Vous devez renseigner l'Adresse",
    })
    .nonempty("Vous devez renseigner l'Adresse"),
  niu_number: z
    .string({
      required_error: "Vous devez renseigner le NIU",
      invalid_type_error: "Vous devez renseigner le NIU",
    })
    .nonempty("Vous devez renseigner le NIU"),
  cni_expired_date: z.coerce.date({
    required_error: "Vous devez renseigner la date d'expiration de la CNI",
    invalid_type_error: "Vous devez renseigner la date d'expiration de la CNI",
  }),
  marital_status: z.preprocess(
    val => getUUID(val),
    z
      .string({
        required_error: "Vous devez choisir une Situation matrimoniale",
        invalid_type_error: "Vous devez choisir une Situation matrimoniale",
      })
      .uuid(),
  ),
  gender: z
    .string({
      required_error: "Vous devez choisir un Sex",
      invalid_type_error: "Vous devez choisir un Sex",
    })
    .nonempty("Vous devez choisir un Sex"),
});

export default schema;
