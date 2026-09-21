import React, { createContext, useContext, useState } from "react";

const UtilsContext = createContext();

export const useHabilitations = () => {
    return useContext(UtilsContext);
};

const UtilsProvider = ({ children }) => {
    const [habilitations, setHabilitations] = useState([]);
    const [sharedProviderData, setSharedProviderData] = useState(null);

    const defineHabilitations = (habilitations) => {
        setHabilitations(habilitations);
    };

    const utilsValue = {
        habilitations,
        defineHabilitations,
        sharedProviderData,
        setSharedProviderData,
    };

    return (
        <UtilsContext.Provider value={utilsValue}>
            {children}
        </UtilsContext.Provider>
    );
};

export default UtilsProvider;
