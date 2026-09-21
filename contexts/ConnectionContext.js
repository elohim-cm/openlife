import React, { createContext, useContext, useState, useEffect } from 'react';

const ConnectionContext = createContext();

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }) => {
    const [connectionStatus, setConnectionStatus] = useState('good');

    useEffect(() => {
        const checkConnection = () => {
            const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
            if (connection) {
                const { effectiveType, downlink } = connection;
                if (effectiveType === 'slow-2g' || effectiveType === '2g' || downlink < 0.5) {
                    setConnectionStatus('slow');
                } else {
                    setConnectionStatus('good');
                }
            } else if (!navigator.onLine) {
                setConnectionStatus('offline');
            } else {
                setConnectionStatus('good');
            }
        };

        const handleOnline = () => {
            setConnectionStatus('good');
        };

        const handleOffline = () => {
            setConnectionStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        checkConnection();

        const connectionInterval = setInterval(checkConnection, 5000); // Vérifiez la connexion toutes les 5 secondes

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            clearInterval(connectionInterval);
        };
    }, []);

    return (
        <ConnectionContext.Provider value={{ connectionStatus }}>
            {children}
        </ConnectionContext.Provider>
    );
};
