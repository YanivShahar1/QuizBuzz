import { useEffect } from 'react';

const useQuestionResponseSubmittedListener = (connection, callback) => {
    useEffect(() => {
        if (!connection) return;

        const handleQuestionResponseSubmitted = (nickname, questionIndex, isCorrect) => {
            console.log(`Received QuestionResponseSubmitted for ${nickname}, QuestionIndex: ${questionIndex}, IsCorrect: ${isCorrect}`);
            callback(nickname, questionIndex, isCorrect);
        };

        connection.on("QuestionResponseSubmitted", handleQuestionResponseSubmitted);
        console.log("Now listening to QuestionResponseSubmitted");

        return () => {
            connection.off("QuestionResponseSubmitted", handleQuestionResponseSubmitted);
            console.log("Stopped listening to QuestionResponseSubmitted");
        };
    }, [connection, callback]);
};

export default useQuestionResponseSubmittedListener;
