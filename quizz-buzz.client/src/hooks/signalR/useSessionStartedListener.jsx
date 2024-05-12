import { useEffect } from 'react';

const useSessionStartedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleSessionStarted = (sessionId) => {
            console.log(`Session ${sessionId} has started`);
            callback(sessionId);
        };

        connection.on("SessionStarted", handleSessionStarted);

        return () => {
            connection.off("SessionStarted", handleSessionStarted);
        };
    }, [connection, callback]);
};

export default useSessionStartedListener;
