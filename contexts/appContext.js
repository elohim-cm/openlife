import {createContext, useContext} from "react";

export let AppContext = createContext({
  /**
   * @type {Theme}
   */
  theme: null,
  togglePageLoading: () => {},
  setSidenavOpen: () => {},
});

//  use dashboard context hook
export const useAppContext = () => {
  return useContext(AppContext);
};
