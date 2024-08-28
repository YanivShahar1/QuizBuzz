import { useEffect } from 'react';

const useUserJoinedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleUserJoined = (sessionID, userId) => {
            console.log(`User ${userId} joined session ${sessionID}`);
            callback(sessionID, userId);
        };

        connection.on("UserJoined", handleUserJoined);
        console.log("now listening to UserJoined");


        return () => {
            connection.off("UserJoined", handleUserJoined);
            console.log("not listening to UserJoined");

        };
    }, [connection, callback]);
};

export default useUserJoinedListener;
