import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import QuizService from '../../services/QuizService';
import QuestionDisplay from '../../components/Question/QuestionDisplay/QuestionDisplay'
import { Link, useNavigate } from 'react-router-dom';
import ErrorPage from '../ErrorPage';

const QuizPage = () => {
    const secPerQuestion = 30;
    const { quizId } = useParams();
    const [quiz, setQuiz] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timer, setTimer] = useState(secPerQuestion);
    const [userAnswer, setUserAnswer] = useState([]);
    const navigate = useNavigate();

    // Fetch quiz data when component mounts
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const fetchedQuiz = await QuizService.fetchQuiz(quizId);
                setQuiz(fetchedQuiz);
            } catch (error) {
                console.error('Error fetching quiz:', error.message);
                // Handle error, display message to the user, or redirect to an error page
            }
        };
        fetchQuiz();
    }, []);

    useEffect(() => {
        // Check if quiz data is available and the current question index is within bounds
        if (quiz && quiz.questions && currentQuestionIndex < quiz.questions.length) {
            const interval = setInterval(() => {
                setTimer(prevTimer => (prevTimer > 0 ? prevTimer - 1 : 0));
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [currentQuestionIndex]);

    const handleAnswerSubmit = () => {
        try {
            if (!quiz) {
                throw new Error('Quiz data not available.');
            }

            const currentQuestion = quiz.questions[currentQuestionIndex];
            if (!currentQuestion) {
                throw new Error('Invalid question index.');
            }

            // Handle user's answer submission
            const isCorrect = userAnswer === currentQuestion.correctOptions;
            console.log(`User's answer is ${isCorrect ? 'correct' : 'incorrect'}`);
            console.log('userAnswer=', userAnswer);
            console.log('correctAnswer=', currentQuestion.correctAnswer);

            if (currentQuestionIndex + 1 < quiz.questions.length) {
                setCurrentQuestionIndex(prevIndex => prevIndex + 1);
                setTimer(10);
                setUserAnswer(null);
            } else {
                console.log('Quiz completed!');
                // Handle quiz completion logic
            }
        } catch (error) {
            console.error('Error while handling answer submit:', error.message);
            // Handle error, display message to the user, or redirect to an error page
        }
    };

    const handleAnswerChange = (index) => {
        if (userAnswer === null) {
            setUserAnswer([index]);
        } else {
            const updatedAnswer = userAnswer.includes(index)
                ? userAnswer.filter((item) => item !== index)
                : [...userAnswer, index];

            setUserAnswer(updatedAnswer);
        }
    };

    if (!quiz) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            {currentQuestionIndex < quiz.questions.length ? (
                <QuestionDisplay
                    question={quiz.questions[currentQuestionIndex]}
                    userAnswer={userAnswer}
                    handleAnswerChange={handleAnswerChange}
                    handleAnswerSubmit={handleAnswerSubmit}
                    timer={timer}
                />
            ) : (
                <p>Quiz completed! Show results or redirect to another page.</p>
            )}
        </div>
    );
};

export default QuizPage;
