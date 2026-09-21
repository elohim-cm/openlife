"use client";
import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import UtilMethods from "@/utils/UtilMethods";
import NotFound from "@/components/NotFound";
import ProductUpdate from "@/components/product/ProductUpdate";

const ProductUpdatePage = () => {
  const context = useAppContext();
  const {authorizations} = JSON.parse(localStorage.getItem("storedValues")) || {};

  useEffect(() => {
    context.togglePageLoading();
  }, []);
  return <>
    {((UtilMethods.isAdmin() || UtilMethods.isPDG())) ? <ProductUpdate/> : <NotFound />}
  </>;
};

export default ProductUpdatePage;
