import {getAuthorization, toCaptitalize} from "@/utils";
import UtilMethods from "../UtilMethods";

class MenuUtils {
  /**
   *
   * @param _menu {string}
   * @returns {boolean}
   */
  static hasMenu(_menu = "", isMini = false) {
    /**
     * @type {{menu: {label: string}}[]}
     */
    const tab = getAuthorization();
    let found = false;
    for (const element of tab) {
      if (element.menu.label.toLowerCase() === _menu.replace("-", " ").toLowerCase()) found = true;
    }
    if (_menu === "dashboard" || ((UtilMethods.isPDG() || UtilMethods.isAdmin()) && _menu === "product")  || (UtilMethods.isAdmin() && _menu === "audit")) { 
      found = true;
    }
    return found;
  }

  /**
   *
   * @param _tab {string[]}
   * @returns {boolean}
   */
  static parentNode(_tab = []) {
    for (const elem of _tab) {
      if (this.hasMenu(elem)) return true;
    }
    return false;
  }
}

export default MenuUtils;
