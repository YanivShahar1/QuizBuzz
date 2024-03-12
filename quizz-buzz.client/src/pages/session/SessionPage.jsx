import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionService from '../../services/SessionService';
import QuizService from '../../services/QuizService';
import AuthService from '../../services/AuthService';
import WaitingRoom from './WaitingRoom';
import QuizQuestion from '../../components/Quiz/QuizQuestion';
import useSessionHub from '../../signalR/useSessionHub';
import useUserResponseSubmittedListener from '../../signalR/useUserResponseSubmittedListener';

const SessionPage = () => {
    const connection = useSessionHub();
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [sessionStarted, setSessionStarted] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);
    const [timer, setTimer] = useState(60);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [question, setQuestion] = useState(null);
    const [nickName, setNickname] = useState(null);
    const isHost = (session) => session.hostUserID === AuthService.getSessionUsername();

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


    // Fetch quiz when session is set
    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const fetchedQuiz = await QuizService.fetchQuiz(session?.associatedQuizID); // Fetch quiz using associatedQuizID
                setQuiz(fetchedQuiz);
            } catch (error) {
                console.error('Error fetching quiz:', error);
            }
        };

        if (session?.associatedQuizID) {
            fetchQuiz();
        }
    }, [session]);


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

    const handleNicknameSubmit = (nickname) => {
        setNickname(nickname);
    };

    const handleAnswerSubmit = () => {
        // Create a new user response object based on the current state
        // TODO: Implement server-side validation to check the correctness of the user's answer
        // and update the 'isCorrect' field accordingly.
        
        
        // Get the correct options for the current question
        const correctOptions = quiz.questions[currentQuestionIndex].correctOptions;

        // Check if the user's answer matches the correct options
        const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctOptions.sort());

        const newUserResponse = {
            // Copy existing fields from userResponse
            // Add or update fields specific to the current question
            SessionID: session.sessionID,
            Nickname: "test",
            QuestionIndex: currentQuestionIndex,
            SelectedOptions: userAnswer,
            IsCorrect : isCorrect, 
            // Other fields...
        };
        console.log("want tot submit newUserResponse:", JSON.stringify(newUserResponse));
        
        SessionService.submitAnswer(newUserResponse);

        // Move to the next question
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    };
    
    // useEffect to re-render the question when currentQuestionIndex changes
  useEffect(() => {
    // Fetch or set the question based on the updated currentQuestionIndex
    // Replace the following line with your logic to get the question data
    if(quiz != null && quiz.questions != null){
        const newQuestion = quiz.questions[currentQuestionIndex];
        console.log(`setting new question: ${newQuestion}`);
        setQuestion(newQuestion);
    }
    else{
        console.log(`quiz or quiz questions is null`);
    }
   
  }, [quiz, currentQuestionIndex]); // Dependency array ensures the effect runs when currentQuestionIndex changes

    if (session == null){
        return (
            <p>Loading session...</p>
        )
    }
  
    
    if (connection == null){
        return (
            <p>Loading connection...</p>
        )
    }
    
    if(!sessionStarted){
        return <WaitingRoom
                    sessionConnection = {connection}
                    session={session}
                    onStartSession={handleSessionStart}
                    onNicknameSubmit={handleNicknameSubmit}
                />
    }
    
    if (isHost(session)){
        return <SessionAdminPage 
                sessionConnection={connection} />
    }

    return (
        <div>
            <h1>Session {session.name}</h1>
            {question?(
                <QuizQuestion
                    question={question}
                    userAnswer={userAnswer}
                    handleAnswerChange={handleAnswerChange}
                    handleAnswerSubmit={handleAnswerSubmit}
                    timer={timer}
                />) 
            :(
                <p>Loading quiz...</p>
            )}
        </div>
    );
};

export default SessionPage;
