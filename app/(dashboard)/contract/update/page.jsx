"use client";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import ContractUpdate from "@/components/Contract/ContractUpdate";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";

const ContractUpdatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, []);
  return <>
    {(UtilMethods.getHabilitations(authorizations, "contract").canUpdate ||
      UtilMethods.getHabilitations(authorizations, "contract").canAmendment) ? <ContractUpdate/> : <NotFound />}
  </>;
};

export default ContractUpdatePage;
