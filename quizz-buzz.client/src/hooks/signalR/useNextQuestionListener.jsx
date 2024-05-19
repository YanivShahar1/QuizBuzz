import { useEffect } from 'react';

const useNextQuestionListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleNextQuestionSubmitted = (questionIndex) => {
            console.log(`Received Next QuestionIndex: ${questionIndex}`);
            callback(questionIndex);
        };

        connection.on("NextQuestion", handleNextQuestionSubmitted);
        console.log("Now listening to NextQuestion");

        return () => {
            connection.off("NextQuestion", handleNextQuestionSubmitted);
            console.log("Stopped listening to NextQuestion");
        };
    }, [connection, callback]);
};

export default useNextQuestionListener;
