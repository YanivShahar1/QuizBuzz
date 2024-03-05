import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionService from '../../services/SessionService';
import WaitingRoom from './WaitingRoom';
import QuizQuestion from '../../components/Quiz/QuizQuestion';

const SessionPage = () => {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [sessionStarted, setSessionStarted] = useState(false);
    const navigate = useNavigate();
    const [userAnswer, setUserAnswer] = useState([]);
    const [timer, setTimer] = useState(60);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

    useEffect(() => {
        let intervalId;

        if (sessionStarted && timer > 0) {
            intervalId = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }

        return () => clearInterval(intervalId);
    }, [sessionStarted, timer]);


    useEffect(() => {
        setSessionStarted(SessionService.isSessionStarted(session));
    }, [session]);
    
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const sessionData = await SessionService.fetchSession(sessionId);
                setSession(sessionData);
                console.log("session is seted");
            } catch (error) {
                console.error('Error fetching session:', error);
                // Handle error (e.g., redirect to error page)
            }
        };

        fetchSession();
    }, [sessionId]);

    const handleSessionStart = async () => {
        try {
            // Call API to start the session
            await SessionService.startSession(sessionId);
            // Update session state to indicate session has started
            setSessionStarted(true);
        } catch (error) {
            console.error('Error starting session:', error);
            // Handle error (e.g., show error message to user)
        }
    };


    const handleAnswerChange = (index) => {
        // Update user's answer based on the selected option
        setUserAnswer((prevAnswer) => {
            if (prevAnswer.includes(index)) {
                // If option is already selected, remove it
                return prevAnswer.filter((ans) => ans !== index);
            } else {
                // Otherwise, add it to the answer list
                return [...prevAnswer, index];
            }
        });
    };

    const handleAnswerSubmit = () => {
        // Submit user's answer for the current question
        // You can implement this logic according to your application requirements
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);

    };

     // Render the QuizQuestion component if session has started and there are questions
     if (sessionStarted && session && session.questions && session.questions.length > 0) {
        return (
            <QuizQuestion
                question={session.questions[currentQuestionIndex]}
                userAnswer={userAnswer}
                handleAnswerChange={handleAnswerChange}
                handleAnswerSubmit={handleAnswerSubmit}
                timer={timer}
            />
        );
    }
    if (session == null){
        return (
            <p>Loading session...</p>
        )
    }
    
    return (
        <div>
            <h1>Session {session.name}</h1>
            {sessionStarted ? (
                <QuizQuestion
                    question={session.questions[currentQuestionIndex]}
                    userAnswer={userAnswer}
                    handleAnswerChange={handleAnswerChange}
                    handleAnswerSubmit={handleAnswerSubmit}
                    timer={timer}
                />
            ) : (
                <WaitingRoom
                    session={session}
                    onStartSession={handleSessionStart}
                />
            )}
        </div>
    );
};

export default SessionPage;
