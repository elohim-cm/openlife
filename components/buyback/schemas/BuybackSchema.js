import {z} from "zod";

const getUUID = val => {
  return val?.uid;
};

const schema = z.object({
  contract: z.preprocess(
    val => getUUID(val),
    z
      .string({
        required_error: "Vous devez choisir un contract",
        invalid_type_error: "Vous devez choisir un contract",
      })
      .uuid(),
    {
      required_error: "Vous devez choisir un contract",
      invalid_type_error: "Vous devez choisir un contract",
    },
  ),
  redemption_type: z.preprocess(
    val => getUUID(val),
    z
      .string({
        required_error: "Vous devez choisir le type de rachat",
        invalid_type_error: "Vous devez choisir le type de rachat",
      })
      .uuid(),
    {
      required_error: "Vous devez choisir le type de rachat",
      invalid_type_error: "Vous devez choisir le type de rachat",
    },
  ),
  payment_system: z.preprocess(
    val => getUUID(val),
    z
      .string({
        required_error: "Vous devez choisir le système de paiement",
        invalid_type_error: "Vous devez choisir le système de paiement",
      })
      .uuid(),
    {
      required_error: "Vous devez choisir le système de paiement",
      invalid_type_error: "Vous devez choisir le système de paiement",
    },
  ),
  phone: z
    .string({
      required_error: "Vous devez renseigner le Numéro de téléphone",
      invalid_type_error: "Vous devez renseigner le Numéro de téléphone",
    })
    .min(9, "Le numéro de téléphone doit avoir au moins 9 chiffres")
    .max(12, "le numéro de téléphone ne doit pas dépasser 12 chiffres")
    .nonempty("Vous devez renseigner le Numéro de téléphone"),
  amount: z.coerce
    .number({
      required_error: "Vous devez renseigner la date de naissance",
      invalid_type_error: "Vous devez renseigner la date de naissance",
    })
    .min(200, "Le montant minimal d'un rachat est 200 FCFA")
    .max(100000, "Le montant maximal d'un rachat est 100.000 FCFA"),
  raison: z.string().optional().nullable(),
  scan_cni_1: z.string().optional().nullable(),
  scan_cni_2: z.string().optional().nullable(),
  beneficiary: z.string().nullable(),
});

export default schema;
