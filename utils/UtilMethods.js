import {PROVIDER, SOUS, SOUSCRIPTIONCODEROLE} from "@/services/roleService";
import {useRouter} from "next/router";
import {getLanguage} from "@/utils/index";
export default class UtilMethods {
    static getStatusParam(_param = "status")
    {
        const queryParams = new URLSearchParams(window.location.search);
        return queryParams.get(_param);
    }
    static  setStatusParam(value, param = "status") {
        const queryParams = new URLSearchParams(window.location.search);
        if (queryParams.has(param)) {
            queryParams.set(param, value);
            const newUrl = window.location.pathname + '?' + queryParams.toString();
            window.history.replaceState({}, '', newUrl);
        }
    }
    static statues = t => ({
        creation: t("creation"),
        draft: t("draft"),
        active: t("active"),
        inactive: t("inactive"),
        processing: t("processing"),
        in_processing: t("inProcessing"),
        rejected: t("rejected"),
        validated: t("validated"),
        confirmation: t("confirmation"),
        acceptance: t("acceptance"),
        approval: t("approval"),
        validation: t("validation"),
        payment: t("payment"),
        cancelled: t("cancelled"),
        read: t("read"),
        unread: t("unread"),
        suspended: t("suspended"),
        fence: t("fence"),
        expired: t("echus"),
        success: t("success"),
        failure: t("failure")
    });

    static gender = t => ({
        Masculin: t("male"),
        Féminin: t("female"),
    });
    static providerNature = t => ({
        Salarié: t("employee"),
        "Non salarié": t("nonEmployee"),
    });
  /**
   * @typedef {Object} Permission
   * @property {string} uid
   * @property {string} label
   */

  /**
   * @typedef {Object} Menu
   * @property {string} uid
   * @property {string} label
   * @property {number} order
   */

  /**
   * @typedef {Object} Habilitation
   * @property {Permission} permission
   * @property {Menu} menu
   */

  /**
   * Gets an object with functions representing permissions based on the provided label.
   *
   * @param {Array<Habilitation>} habilitations
   * @param {string} label
   * @returns {Object}
   * @property {boolean} canRead
   * @property {boolean} canCreate
   * @property {boolean} canUpdate
   * @property {boolean} canDelete
   */
    static getHabilitations(habilitations, label)
    {
        const filteredHabilitations =
        habilitations?.filter(
            authorization =>
            authorization.permission.label === "create " + label ||
            authorization.permission.label === "delete " + label ||
            authorization.permission.label === "read " + label ||
            authorization.permission.label === "update " + label ||
            authorization.permission.label === "fit " + label ||
            authorization.permission.label === "clone " + label ||
            authorization.permission.label === "transfer " + label ||
            authorization.permission.label === "deactivate " + label ||
            authorization.permission.label === "reassign " + label ||
            authorization.permission.label === "download " + label ||
            authorization.permission.label === "reactivate " + label ||
            authorization.permission.label === "suspend " + label ||
            authorization.permission.label === "cancel " + label ||
            authorization.permission.label === "processing " + label ||
            authorization.permission.label === "approve " + label ||
            authorization.permission.label === "reject " + label ||
            authorization.permission.label === "validate " + label ||
            authorization.permission.label === "pay " + label ||
            authorization.permission.label === "read collection " + label ||
            authorization.permission.label === "read redemption " + label ||
            authorization.permission.label === "payment status " + label ||
            authorization.permission.label === "accept " + label ||
            authorization.permission.label === "amendment " + label ||
            authorization.permission.label === "redemption " + label ||
            authorization.permission.label === "confirmation " + label ||
            authorization.permission.label === "export " + label,
        ) || [];

        return {
            canFit: !!filteredHabilitations.find(authorization => authorization.permission.label === "fit " + label),
            canDeactivate: !!filteredHabilitations.find(
                authorization => authorization.permission.label === "deactivate " + label,
            ),
        canReassign: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "reassign " + label,
        ),
        canExport: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "export " + label,
        ),
        canRedemption: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "redemption " + label,
        ),
        canDownload: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "download " + label,
        ),
        canReactivate: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "reactivate " + label,
        ),
        canSuspend: !!filteredHabilitations.find(authorization => authorization.permission.label === "suspend " + label),
        canClone: !!filteredHabilitations.find(authorization => authorization.permission.label === "clone " + label),
        canTransfer: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "transfer " + label,
        ),
        canRead: !!filteredHabilitations.find(authorization => authorization.permission.label === "read " + label),
        canCreate: !!filteredHabilitations.find(authorization => authorization.permission.label === "create " + label),
        canUpdate: !!filteredHabilitations.find(authorization => authorization.permission.label === "update " + label),
        canDelete: !!filteredHabilitations.find(authorization => authorization.permission.label === "delete " + label),
        canCancel: !!filteredHabilitations.find(authorization => authorization.permission.label === "cancel " + label),
        canProcessing: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "processing " + label,
        ),
        canApprove: !!filteredHabilitations.find(authorization => authorization.permission.label === "approve " + label),
        canAccept: !!filteredHabilitations.find(authorization => authorization.permission.label === "accept " + label),
        canReject: !!filteredHabilitations.find(authorization => authorization.permission.label === "reject " + label),
        canValidate: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "validate " + label,
        ),
        canPay: !!filteredHabilitations.find(authorization => authorization.permission.label === "pay " + label),
        canReadCollection: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "read collection " + label,
        ),
        canReadRedemption: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "read redemption " + label,
        ),
        canPaymentStatus: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "payment status " + label,
        ),
        canAmendment: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "amendment " + label,
        ),
        canConfirm: !!filteredHabilitations.find(
            authorization => authorization.permission.label === "confirmation " + label,
        ),
        };
    }
    static check({email})
    {
        if (typeof window === 'undefined') return false;
        const {authCredentials} = JSON.parse(localStorage.getItem("storedValues")) || {};
        if (email === authCredentials?.email) {
            return true;
        }
        return false;
    }

    static canSubscribe()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        return SOUSCRIPTIONCODEROLE.includes(access?.role.code);
    }
    static isoToEmoji(code)
    {
        return code
        ?.split("")
        .map(letter => (letter.charCodeAt(0) % 32) + 0x1f1e5)
        .map(n => String.fromCodePoint(n))
        .join("");
    }

    static centerAlignColumns = columnsToCenter => columns => {
        return columns.map(column => ({
            ...column,
            options: {
                ...column.options,
                customHeadRender: columnMeta => (
                <th
                style={{
                    fontSize: "16px",
                    padding: "0 16px",
                    textAlign: columnsToCenter.includes(column.name) ? "center" : "left",
                    }}>
                {columnMeta.label}
                </th>
            ),
            customBodyRender: (value, tableMeta) => {
                if (column.name === "actions") {
                    return (
                    <div
                    className="__action-action"
                    style={{
                        textAlign: columnsToCenter.includes(column.name) ? "center" : "left",
                        }}>
                    {value}
                    </div>
                    );
                }
                return <div style={{textAlign: columnsToCenter.includes(column.name) ? "center" : "left"}}>{value}</div>;
                },
            },
        }));
    };

    static roleMatching = t => ({
        ADMIN: t("administrator"),
        SOUS: t("subscriber"),
        APP: t("provider"),
        INP: t("inspector"),
        MNG: t("manager"),
        ANM: t("animator"),
        DCOM: t("commercialDirector"),
        SCL: t("customerService"),
        TECH: t("technicalReferent"),
        TRE: t("tresorier"),
        PDG: t("pdg"),
    });

  /**
   *
   * @returns {string}
   */
    static getAuthCode()
    {
        if (typeof window === 'undefined') return "";
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access?.role.code === "ADMIN" || access?.role.code === "DCOM") {
            return "";
        }
        return access?.code || "";
    }
    static getAuthCodeSecond()
    {
        if (typeof window === 'undefined') return "";
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        return access?.role.code || "";
    }

    static translation_correspondance = t => ({
        'first_name' : t('firstName'),
        'last_name' : t('lastName'),
        'email' : t('email'),
        'main_phone' : t('mainPhone'),
        'secondary_phone' : t('secondaryPhoneNumber'),
        'birth_day' : t('birthdate'),
        'birth_place' : t('birthplace'),
        'address' : t('address'),
        'niu_number' : t('NIUnumber'),
        'cni_number' : t('IDCardNumber'),
        'cni_expired_date' : t('IDCardExpirationDate'),
        'marital_status' : t('maritalStatus'),
        'gender' : t('gender'),
        'affiliation' : t('affiliation'),
        'phone' : t('phone'),
        'label' : t('label'),
        'uid' : 'uid',
        'subscriber' : t('subscribers'),
        'life_beneficiary' : t('lifeBeneficiaries'),
        'death_beneficiary' : t('deathBeneficiaries'),
        'person_contact' : t('contactPersonInCaseOfDeath'),
        'collection_sum' : t('collectionSum'),
        'redemption_value' : t('redemptionValue'),
        'provision_value' : t('provisionValue'),
        'updated_at' : t('updatedOn'),
        'prime' : t('prime'),
        'duration' : t('duration'),
        'type_signature': t('typeSignature'),
        'is_not_subscriber' : t('isNotSubscriber'),
        'draft': t('draft'),
    })


    static isSubscriber()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "SOUS") {
            return true;
        }
        return false;
    }

    static isAdmin()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "ADMIN") {
            return true;
        }
        return false;
    }

    static isTechnicalReferent()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "TECH") {
            return true;
        }
        return false;
    }

    static isTresearer()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "TRE") {
            return true;
        }
        return false;
    }

    static isMANAGER()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "MNG") {
            return true;
        }
        return false;
    }

    static isINPECTOR()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "INP") {
            return true;
        }
        return false;
    }

    static isPDG()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "PDG") {
            return true;
        }
        return false;
    }

    static isAnimator()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "ANM") {
            return true;
        }
        return false;
    }

    static isDCOM()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "DCOM") {
            return true;
        }
        return false;
    }

    static getLanguage()
    {
        let language = getLanguage();
        if (language === "en-US" || language === "fr-FR") {
            language = language.split("-")[0];
        }
        return language;
    }

    static getSubscriberStatus(status)
    {
        const roleToReject = ["acceptance", "approval", "validation"];
        if (this.isSubscriber() && roleToReject.includes(status)) {
            return "in_processing";
        }

        return status;
    }

    static isProvider()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "APP") {
            return true;
        }
        return false;
    }

    static isAuthorizeToReadInContract()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        const requiredRoleCode = ["APP", "SOUS", "SCL"];

        if (access &&  requiredRoleCode.includes(access.role?.code)) {
            return true;
        }
        return false;
    }

    static isCommercialDirector()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "DCOM") {
            return true;
        }
        return false;
    }
    static isCustomerService()
    {
        if (typeof window === 'undefined') return false;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access && access.role.code === "SCL") {
            return true;
        }
        return false;
    }
    static buildQueryString(params)
    {
        const queryString = Object.keys(params)
        .filter(key => params[key] !== "")
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join("&");
        return queryString;
    }

    static getRoleCode(){
        if (typeof window === 'undefined') return '';
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        if (access) {
            return access.role.code;
        }
        return '';
    }
    static getProviderRoleSearch()
    {
        if (typeof window === 'undefined') return undefined;
        const {access: accesses, currentAccess} = JSON.parse(localStorage.getItem("storedValues")) || {};
        const access = accesses?.find(access => access.uid === currentAccess);

        const code = access?.role.code;

        switch (code) {
            case "ADMIN":
            return "pdg";
            case "PDG":
            return "dcom";
            case "DCOM":
            return "inspector";
            default:
            break;
        }
    }

    static getStoredValues() {
        if (typeof window === 'undefined') {
            return JSON.parse(Constants.defaultStoredValue || '{}');
        }
        try {
            return JSON.parse(localStorage.getItem("storedValues") || Constants.defaultStoredValue || '{}');
        } catch (e) {
            return JSON.parse(Constants.defaultStoredValue || '{}');
        }
    }

    static formatInternationalPhone(phone) {
        if (!phone) return "";
        let cleaned = phone.trim();

        // Already has '+'
        if (cleaned.startsWith("+")) {
            return cleaned;
        }

        const prefixes = ["237", "33", "241", "225", "221", "224"];

        for (const prefix of prefixes) {
            if (cleaned.startsWith(prefix) && cleaned.length > prefix.length + 6) {
                return `+${cleaned}`;
            }
        }

        return `+237${cleaned}`;
    }
}
