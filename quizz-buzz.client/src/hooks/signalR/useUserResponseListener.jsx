import { useEffect } from 'react';
const useUserResponseSubmittedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleUserAnswered = (nickname,questionIndex, response) => {
            console.log(`user ${nickname} response to question number ${questionIndex} : ${JSON.stringify(response)}`);
            
            callback(nickname, questionIndex, response);
        };

        connection.on("UserAnswered", handleUserAnswered);

        return () => {
            connection.off("UserAnswered", handleUserAnswered);
        };
    }, [connection, callback]);
};

export default useUserResponseSubmittedListener;
