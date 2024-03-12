import { useEffect } from 'react';

const useUserResponseSubmittedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleUserResponseSubmitted = (userResponse) => {
            console.log("Received UserResponseSubmitted event:", userResponse);
            callback(userResponse);
        };

        connection.on("UserResponseSubmitted", handleUserResponseSubmitted);

        return () => {
            connection.off("UserResponseSubmitted", handleUserResponseSubmitted);
        };
    }, [connection, callback]);
};

export default useUserResponseSubmittedListener;
