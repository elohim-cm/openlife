"use client";

import {useAppContext} from "@/contexts/appContext";
import {useEffect} from "react";
import CollectionList from "@/components/Collection/CollectionList";

const CollectionPage = () => {
  const context = useAppContext();

  useEffect(() => {
    context.togglePageLoading();
  }, []);

  return (
    <>
      <CollectionList />
    </>
  );
};

export default CollectionPage;
