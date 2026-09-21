import {PROFIL} from "@/utils/routes/routes";

const Routes = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  DASHBOARD_BUSINESS: "/dashboard-business",
  ROLES: "/role",
  PROFIL: "/profil",
  ROLE_CREATE: "/role/create",
  ROLE_UPDATE: uid => "/role/update?uid=" + uid,
  SIMULER: "/simuler",
  SOUSCRIPTION: "/subscription",
  SOUSCRIPTION_LIST: "/sells/subscription",
  COMMISSION_LIST: "/commission",
  SOUSCRIPTION_DETAILS: uid => `/sells/subscription/details?uid=${uid}`,
  SOUSCRIPTION_UPDATE: uid => `/subscription/update?uid=${uid}`,
  SOUS_CONFIRM: "/subscription/confirm",
  SOUS_SUCCESS: "/subscription/success",
  RACHAT_DETAILS: uid => `/redemption/details?uid=${uid}`,
  CONTRACT_DETAILS: uid => `/contract/details?uid=${uid}`,
  COLLECTION_DETAILS: uid => `/collection/details?uid=${uid}`,
  AUDIT_DETAILS: uid => `/piste-audit/details?uid=${uid}`,
  CONDITIONTERM: "https://openlife.acamvie.com/web/site/politique",
  FAQ: "/faq",
  CONTACT: "/contact-us",
  /**
   *
   * @param _url {string|number}
   * @param params {{label: string, value: string}[]}
   */
  withParams: (_url, params) => {
    if (!params) throw new Error("You must provide a params array");
    let url = _url + "?";
    for (let i = 0; i < params.length; i++) {
      if (i === 0) url += `${params[i].label}=${params[i].value}`;
      else url += `&${params[i].label}=${params[i].value}`;
    }
    return url;
  },
  /**
   *
   * @param _url {string}
   * @param params {{}[]}
   * @return {string}
   */
  withParameters: (_url, params = []) => {
    if (!params) throw new Error("You must provide a params array");
    let url = _url + "?";
    for (let i = 0; i < params.length; i++) {
      const item = params[i];
      let keys = Object.keys(item);
      if (i === 0) url += `${keys[0]}=${item[keys[0]]}`;
      else url += `&${keys[0]}=${item[keys[0]]}`;
    }
    return url;
  },
};

export default Routes;
