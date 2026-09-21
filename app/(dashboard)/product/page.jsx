"use client";

import React, {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";
import ProductList from "@/components/product/ProductList";

const ProductPage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, [context]);

  return <>
    {
      (UtilMethods.isAdmin() || UtilMethods.isPDG())? <ProductList/>
        : <NotFound />
    }
  </>
};

export default ProductPage;
