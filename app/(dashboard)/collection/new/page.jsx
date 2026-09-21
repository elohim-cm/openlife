"use client";

import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import NewCollection from "@/components/Collection/NewCollection";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const NewCollectionPage = () => {
  const context = useAppContext();
  const {
    authorizations,
  } = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  return <>
    {UtilMethods.getHabilitations(authorizations, "collection").canCreate? <NewCollection />
        :<NotFound />
    }
  </> ;
};

export default NewCollectionPage;
