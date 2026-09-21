"use client";

import AccountDetails from "@/components/Account/AccountDetails";
import React, {useEffect, useState} from "react";
import {getAccount} from "@/services/accountService";
import {useAppContext} from "@/contexts/appContext";
import {getUid} from "@/utils";
import UtilMethods from "@/utils/UtilMethods";
import AccountUpdate from "@/components/Account/AccountUpdate";
import NotFound from "@/components/NotFound";

const DetailsPage = () => {
  const [accountDetail, setAccountDetails] = useState({});
  const context = useAppContext();
    const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const uid = getUid();
    //get the user to update
    getAccount(token, uid)
      .then(response => {
        //  user info
        const {
          data: {data: userInfo},
        } = response;

        //  update account details state
        setAccountDetails(userInfo);
      })
      .catch(err => {});
  }, []);

  return <>
      {
          UtilMethods.getHabilitations(authorizations, 'account').canRead ? <AccountDetails accountDetails={accountDetail} />
              : <NotFound />
      }
  </>
};

export default DetailsPage;
