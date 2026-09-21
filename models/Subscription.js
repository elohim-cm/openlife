class SubscriptionModel {
  uid;
  code;
  prime;
  accessory;
  amount;
  duration;
  effective_date;
  due_date;
  status;
  /**
   *
   * @type {[{uid: "string", created_at: "string", updated_at: "string", person: {uid: "string", code: "string", gender: string, marital_status: string, last_name: "string", first_name: "string", main_phone: "string", secondary_phone: "string", birth_date: string, birth_place: "string", address: "string", email: "string", cni_number: "string", cni_expired_at: string, nui_number: "string", created_at: "string", updated_at: "string"}}]}
   */
  subscribers;
  /**
   *
   * @type {[{uid: "string", affiliation: {label: string, uid: string}, created_at: "string", updated_at: "string", person: {uid: "string", code: "string", gender: string, marital_status: string, last_name: "string", first_name: "string", main_phone: "string", birth_date: string, birth_place: "string", address: "string", email: "string", cni_number: "string", cni_expired_at: string, nui_number: "string", created_at: "string", updated_at: "string"}}]}
   */
  life_beneficiaries;
  /**
   *
   * @type {[{uid: "string", affiliation: {label: string, uid: string}, created_at: "string", updated_at: "string", person: {uid: "string", code: "string", gender: string, marital_status: string, last_name: "string", first_name: "string", main_phone: "string", birth_date: string, birth_place: "string", address: "string", email: "string", cni_number: "string", cni_expired_at: string, nui_number: "string", created_at: "string", updated_at: "string"}}]}
   */
  death_beneficiaries;
  /**
   *
   * @type {[{uid: "string", affiliation: {label: string, uid: string}, created_at: "string", updated_at: "string", person: {uid: "string", code: "string", gender: string, marital_status: string, last_name: "string", first_name: "string", main_phone: "string", birth_date: string, birth_place: "string", address: "string", email: "string", cni_number: "string", cni_expired_at: string, nui_number: "string", created_at: "string", updated_at: "string"}}]}
   */
  person_contacts;
  /**
   *
   * @type {{uid: "string", code: "string", last_name: "string", first_name: "string", phone: "string", created_at: "string", updated_at: "string"}}
   */
  provider;
  /**
   *
   * @type {{uid: "string", label: "string", payment_method: {uid: "string", label: "string", created_at: "string", updated_at: "string"}, created_at: "string", updated_at: "string"}}
   */
  payment_system;
  /**
   *
   * @type {{uid: "string", label: "string", created_at: "string", updated_at: "string"}}
   */
  product;
  created_at;
  updated_at;

  validate(jsonData) {
    return (
      jsonData &&
      jsonData.uid !== undefined &&
      jsonData.code !== undefined &&
      jsonData.prime !== undefined &&
      jsonData.accessory !== undefined &&
      jsonData.amount !== undefined &&
      jsonData.duration !== undefined &&
      jsonData.effective_date !== undefined &&
      jsonData.due_date !== undefined &&
      jsonData.status !== undefined &&
      jsonData.subscribers &&
      jsonData.life_beneficiaries &&
      jsonData.death_beneficiaries &&
      jsonData.person_contacts &&
      jsonData.provider &&
      jsonData.product &&
      jsonData.created_at !== undefined
    );
  }

  fromJson(jsonData) {
    if (!this.validate(jsonData)) throw new Error("Error: Data validation failed");
    for (let key in jsonData) {
      this[key] = jsonData[key];
    }
  }
}

export default SubscriptionModel;
