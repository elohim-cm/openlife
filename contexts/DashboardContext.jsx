import { createContext, useContext } from "react";

//  dashboard  context
export const DashboardContext = createContext(undefined)

//  use dashboard context hook
export const useDashboardContext = () => {
  const userData = useContext(DashboardContext)

  if (userData === undefined) {
    throw new Error('You must provide the userData object in the dashboard context')
  }

  return userData
}

export default DashboardContext