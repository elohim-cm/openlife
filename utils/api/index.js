import Routes from "@/utils/routes";
import Toast from "@/utils/toast";
import AuthService from "@/services/AuthService";

/**
 *
 * @param _response {AxiosError}
 * @param _router {AppRouterInstance}
 */
const canInterprateError = (_response, _router) => {
  if (_response) {
    if (_response.response) {
      if (_response.response.status === 401) {
        // Token expired, handle redirect and store last visited page
        if (localStorage.getItem('lastVisitedPage') === null)
          localStorage.setItem('lastVisitedPage', window.location.href);

        AuthService.logout();
        if (_router) _router.push(Routes.LOGIN);
      }
      if (_response.response.data) {
        if (_response.response.data.message) {
          return true;
        }
      }
    }
  }
  return false;
};

/**
 *
 * @param _error {AxiosError}
 * @param _router {AppRouterInstance}
 */
const displayHttpError = (_error, _router) => {
  if (canInterprateError(_error, _router)) {
    Toast.error(_error.response.data.message);
  } else {
    Toast.error("Une erreur est survenu");
  }
};

export const extractUidFromPath = (path) => {
  const pathSegments = path.split('/');
  const uid = pathSegments[pathSegments.length - 1];
  return uid || null;
};
export {canInterprateError, displayHttpError};
