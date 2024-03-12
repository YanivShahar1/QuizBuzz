import { useEffect } from 'react';

const useUserJoinedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleUserJoined = (userId) => {
            console.log(`User ${userId} joined the session`);
            callback(userId);
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
