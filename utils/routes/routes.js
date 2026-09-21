// home
export const HOME_PAGE = "/";

// subscription
export const SUBSCRIPTION_PAGE = "/subscription";

// sign in
export const LOGIN_PAGE = "/login";

// forgot
export const FORGOT = "/forgot";

// password reset
export const PASSWORD_RESET_PAGE = (msg = "") => `/reset?msg=${msg}`;

// dashboard
export const DASHBOARD_PAGE = "/dashboard";

// account listing page
export const ACCOUNT_LISTING_PAGE = "/account";

// create account page
export const CREATE_ACCOUNT_PAGE = "account/create";

// account details page
export const ACCOUNT_DETAILS_PAGE = uid => `/account/details?uid=${uid}`;

// account update page
export const ACCOUNT_UPDATE_PAGE = uid => `/account/update?uid=${uid}`;

// account details page
export const PERMISSION_LISTING_PAGE = `/permissions`;

// access select page
export const ACCESS_SELECTION_PAGE = `/access-selection`;

// authorization listing page
export const AUTHORIZATION_LISTING_PAGE = `/authorization`;

// authorization create page
export const AUTHORIZATION_CREATE_PAGE = `/authorization/create`;

// authorization update page
export const AUTHORIZATION_UPDATE_PAGE = uid => `/authorization/update?uid=${uid}`;

//  access page
export const ACCESS_PAGE = `/access`;

//  access update
export const ACCESS_UPDATE = uid => `/access/update?uid=${uid}`;

//  access create page
export const ACCESS_CREATE_PAGE = `/access/create`;

//  menu page
export const MENU_PAGE = `/menu`;

//  menu create page
export const MENU_CREATE_PAGE = `/menu/create`;

//  menu update page
export const MENU_UPDATE_PAGE = uid => `/menu/update?uid=${uid}`;

// network routes ----------------------------------------------------------------

export const NETWORK_UPDATE = uid => `/network/update?uid=${uid}`;

export const NETWORK_CREATE = `/network/create`;

export const NETWORK_LIST = `/network`;

// business-goal routes ----------------------------------------------------------------

export const BUSINESS_GOAL_UPDATE = uuid => `/business-goal/update?uid=${uuid}`;

export const BUSINESS_GOAL_READ = uuid => `/business-goal/read?uid=${uuid}`;

export const BUSINESS_GOAL_CREATE = `/business-goal/create`;

export const BUSINESS_GOAL_BULK_CREATE = `/business-goal/bulk-create`;

export const BUSINESS_GOAL_LIST = `/business-goal`;

// distribution area routes ----------------------------------------------------------------

export const AREA_UPDATE = uid => `/distribution-area/update?uid=${uid}`;

export const AREA_CREATE = `/distribution-area/create`;

export const AREA_LIST = `/distribution-area`;

// animation team area routes ----------------------------------------------------------------

export const TEAM_UPDATE = uid => `/animation-team/update?uid=${uid}`;

export const TEAM_CREATE = `/animation-team/create`;

export const TEAM_LIST = `/animation-team`;

// providers routes ----------------------------------------------------------------

export const PROVIDER_UPDATE = uid => `/provider/update?uid=${uid}`;

export const PROVIDER_READ = uid => `/provider/read?uid=${uid}`;

export const PROVIDER_CREATE = `/provider/create`;

export const PROVIDER_BULK_CREATE = `/animation-team/bulk-create`;

export const PROVIDER_LIST = `/provider/`;

// collection routes ----------------------------------------------------------------

export const COLLECTION_NEW = `/collection/new`;

export const COLLECTION_LIST = `/collection`;

// providers routes ----------------------------------------------------------------

export const CONTRACT_UPDATE = uid => `/contract/update?uid=${uid}`;
export const CONTRACT_SHOW = uid => `/contract/show?uid=${uid}`;

export const CONTRACT_LIST = `/contract`;

// providers routes ----------------------------------------------------------------

export const BUYBACK_LIST = `/redemption`;

export const BUYBACK_NEW = `/redemption/new`;

export const BUYBACK_SHOW = uuid => `/redemption/details?uid=${uuid}`;

// profil route ----------------------------------------------------------------
export const PROFIL = `/profil`;

// Role route ----------------------------------------------------------------
export const ROLE_LIST = `/role`;
export const ROLE_CREATE = `/role/create`;
export const ROLE_UPDATE = uuid => `/role/update?uid=${uuid}`;
export const ROLE_DETAILS = uid => `/role/details?uid=${uid}`;

// Wallet route ----------------------------------------------------------------
export const WALLET_LIST = `/sells/relationships`;
export const WALLET_UPDATE = (uid, _indicator='') => `/sells/relationships/update?uid=${uid}&indicator=${_indicator}`;
export const WALLET_DETAILS = (uid, label) => `/sells/relationships/detail?uid=${uid}&label=${label}`;

// Payment route ----------------------------------------------------------------
export const PAYMENT_LIST = `/sells/payment`;
export const PAYMENT_READ = uid => `/sells/payment/read?uid=${uid}`;

// Payment redemption route ----------------------------------------------------------------
export const PAYMENT_REDEMPTION_LIST = `/redemption/payment`;
export const PAYMENT_REDEMPTION_READ = uid => `/redemption/payment/read?uid=${uid}`;

// Commission route ----------------------------------------------------------------
export const COMMISSION_READ = uid => `/commission/detail?uid=${uid}`;

//  notifications listing route
export const NOTIFICATION_LISTING = `/notification`;


// product routes ----------------------------------------------------------------

export const PRODUCT_UPDATE = uid => `/product/update?uid=${uid}`;
