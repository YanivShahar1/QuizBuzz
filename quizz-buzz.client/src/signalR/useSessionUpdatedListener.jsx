// useSessionUpdatedListener.js
import { useEffect } from 'react';

const useSessionUpdatedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleSessionUpdated = () => {
            console.log(`Session has been updated:`);
            callback();
        };

        connection.on("SessionUpdated", handleSessionUpdated);

        return () => {
            connection.off("SessionUpdated", handleSessionUpdated);
        };
    }, [connection, callback]);
};

export default useSessionUpdatedListener;
