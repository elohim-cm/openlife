"use client";

import {useEffect} from "react";
import {useAppContext} from "@/contexts/appContext";

const PageLayout = ({children}) => {
  const context = useAppContext();
  useEffect(() => {
    context.setSidenavOpen(false);
  });

  return children;
};

export default PageLayout;
