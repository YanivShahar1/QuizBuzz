// useSessionUpdatedListener.js
import { useEffect } from 'react';

const useSessionUpdatedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleSessionUpdated = (sessionID) => {
            console.log(`Session ${sessionID} has been updated:`);
            callback(sessionID);
        };

        connection.on("SessionUpdated", handleSessionUpdated);

        return () => {
            connection.off("SessionUpdated", handleSessionUpdated);
        };
    }, [connection, callback]);
};

export default useSessionUpdatedListener;
