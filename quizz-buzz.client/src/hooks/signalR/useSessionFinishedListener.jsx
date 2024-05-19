import { useEffect } from 'react';

const useSessionFinishedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleSessionFinished = () => {
            console.log(`Session has finished`);
            callback();
        };

        connection.on("SessionFinished", handleSessionFinished);

        return () => {
            connection.off("SessionFinished", handleSessionFinished);
        };
    }, [connection, callback]);
};

export default useSessionFinishedListener;
