class ContractModel {

  static getStatus() {
    return localStorage.getItem('contract');
  }
  /**
   * @type {string}
   */
  uid;

  /**
   * @type {string}
   */
  status;

  /**
   * @type {string}
   */
  code;

  /**
   * @type {string}
   */
  prime;

  /**
   * @type {string}
   */
  duration;

  /**
   * @type {string}
   */
  effective_date;

  /**
   * @type {string}
   */
  due_date;

  /**
   * @type {string}
   */
  created_at;

  /**
   * @type {string}
   */
  updated_at;

  /**
   * @type {[{uid: string, code: string, prime: string, accessory: string, amount: string,
   *   duration: string, effective_date: string, due_date: string, cni_file_main: string,
   *   cni_file_secondary: string, status: string, subscribers: [{uid: string, created_at: string,
   *   updated_at: string, person: {uid: string, code: string, last_name: string, first_name:
   *   string, main_phone: string, birth_date: string, birth_place: string, gender: {uid: string,
   *   label: string, created_at: string, updated_at: string}, marital_status: {uid: string,
   *   label: string, created_at: string, updated_at: string}, address: string, email: string,
   *   cni_number: string, cni_expired_at: string, nui_number: string, created_at: string,
   *   updated_at: string}, affiliation: {uid: string, label: string, created_at: string,
   *   updated_at: string}}], life_beneficiaries: [{uid: string, created_at: string,
   *   updated_at: string, person: {uid: string, code: string, last_name: string, first_name:
   *   string, main_phone: string, birth_date: string, birth_place: string, gender: {uid: string,
   *   label: string, created_at: string, updated_at: string}, marital_status: {uid: string,
   *   label: string, created_at: string, updated_at: string}, address: string, email: string,
   *   cni_number: string, cni_expired_at: string, nui_number: string, created_at: string,
   *   updated_at: string}, affiliation: {uid: string, label: string, created_at: string,
   *   updated_at: string}}], death_beneficiaries: [{uid: string, created_at: string,
   *   updated_at: string, person: {uid: string, code: string, last_name: string, first_name:
   *   string, main_phone: string, birth_date: string, birth_place: string, gender: {uid: string,
   *   label: string, created_at: string, updated_at: string}, marital_status: {uid: string,
   *   label: string, created_at: string, updated_at: string}, address: string, email: string,
   *   cni_number: string, cni_expired_at: string, nui_number: string, created_at: string,
   *   updated_at: string}, affiliation: {uid: string, label: string, created_at: string,
   *   updated_at: string}}], person_contacts: [{uid: string, created_at: string,
   *   updated_at: string, person: {uid: string, code: string, last_name: string, first_name:
   *   string, main_phone: string, birth_date: string, birth_place: string, gender: {uid: string,
   *   label: string, created_at: string, updated_at: string}, marital_status: {uid: string,
   *   label: string, created_at: string, updated_at: string}, address: string, email: string,
   *   cni_number: string, cni_expired_at: string, nui_number: string, created_at: string,
   *   updated_at: string}, affiliation: {uid: string, label: string, created_at: string,
   *   updated_at: string}}], provider: {"uid": "string", "code": "string", "last_name": "string",
   *   "first_name": "string", "phone": "string", "adresse": "string", "sexe": "string",
   *   "professional_email": "string", "personal_email": "string", "provider_nature": {"uid":
   *   "string", "label": "string", "commission_rate": "string", "tax_rate": "string",
   *   "created_at": "string", "updated_at": "string"}, "animation_team": {"uid": "string", "name":
   *   "string","code": "string", "description": "string", "animator": {}, "distribution_area":
   *   {"uid": "string", "name": "string", "code": "string", "description": "string", "manager":
   *   {}, "reseau": {"uid": "string", "name": "string", "code": "string", "description": "string",
   *   "inspector": {}, "parent": {}, "created_at": "string", "updated_at": "string"},
   *   "created_at": "string", "updated_at": "string"}, "created_at": "string","updated_at":
   *   "string"}, "created_at": "string", "updated_at": "string"}, payment_system: {"uid":
   *   "string", "label": "string", "payment_method": {"uid": "string", "label": "string",
   *   "created_at": "string", "updated_at": "string"}, "created_at": "string", "updated_at":
   *   "string"}, product: {"uid": "string", "label": "string", "created_at": "string",
   *   "updated_at": "string"}, created_at: string, updated_at: string}]}
   */
  subscription;

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
      jsonData.created_at !== undefined &&
      jsonData.updated_at !== undefined
    );
  }

  fromJson(jsonData) {
    if (!this.validate(jsonData)) throw new Error("Error: Data validation failed");
    for (let key in jsonData) {
      this[key] = jsonData[key];
    }
  }

}

export default ContractModel;
