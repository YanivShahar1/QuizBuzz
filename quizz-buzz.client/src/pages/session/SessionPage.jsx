import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Leaderboard from '../../components/Leaderboard/Leaderboard';
import SessionService from '../../services/SessionService';
import QuizService from '../../services/QuizService';
import AuthService from '../../services/AuthService';
import WaitingRoom from './WaitingRoom';
import QuizQuestion from '../../components/Quiz/QuizQuestion';
import useSessionHub from '../../signalR/useSessionHub';
import SessionAdminStatistics from '../../components/Session/SessionAdminStatistics';
import useSessionStartedListener from '../../signalR/useSessionStartedListener';
import useQuestionResponseSubmittedListener from '../../signalR/useQuestionResponseSubmittedListener'
import useSessionUpdatedListener from '../../signalR/useSessionUpdatedListener'

const SessionPage = () => {
    const connection = useSessionHub();
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [isSessionStarted, setSessionStarted] = useState(false);
    const [isSessionFinished, setSessionFinished] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [question, setQuestion] = useState(null);
    const [nickname, setNickname] = useState(null);
    const [responses, setResponses] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]); 

    const isHost = () => {
        if (session) {
            return session.hostUserID === AuthService.getSessionUsername();
        }
        console.log("session isnot defined yet, cant know if host, so return false!");
        return false; // Return false if session is null
    };

    const fetchSessionData = async () => {
        try {
            const sessionData = await SessionService.fetchSession(sessionId);
            setSession(sessionData);
            console.log("session is set");
            
            if (sessionData?.associatedQuizID) {
                const fetchedQuiz = await QuizService.fetchQuiz(sessionData.associatedQuizID);
                setQuiz(fetchedQuiz);
                console.log("quiz is set");
                if(isHost()){
                    connection.invoke("UserJoined", session.sessionID,session.hostUserID );
                }
                else{
                    console.log("not host..");
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error (e.g., redirect to error page)
        }
    };

    useEffect(() => {
        fetchSessionData();
    }, [sessionId]);
    
    const startSession = async () => {
        try {
            // Call API to start the session
            console.log("in startSession");
            if(isHost(session)){
                console.log("in startSession-< HOST!");

                await SessionService.startSession(sessionId);       
            }
            else{
                console.log("in startSession-< not host...............");

            }
            await connection.invoke("SessionStarted", session.sessionID);
            
            // Update session state to indicate session has started
            setSessionStarted(true);
        } catch (error) {
            console.error('Error starting session:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const handleSessionUpdated = async () => {
        try {
            console.log("execute handleSessionUpdated()");
            fetchSessionData();

        } catch (error) {

        }
    }
    const handleSessionStarted = async () => {
        try {
            // Call API to start the session
            console.log("receive from singlarR: handleSessionStarted");
            
            // Update session state to indicate session has started
            // Fetch session participants and update the session state
            const sessionParticipants = await SessionService.getParticipants(session.sessionID);
            await setSession(prevSession => ({
                ...prevSession,
                participants: sessionParticipants
            }));

            setSessionStarted(true);
            console.log("started!:)");
            
        } catch (error) {
            console.error('Error starting session:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    useEffect(() => {
        console.log(`isSessionStarted = ${isSessionStarted}`);
    }, [isSessionStarted])

    useEffect(() => {
        console.log(`isSessionFinished = ${isSessionFinished}`);
    }, [isSessionFinished])

    useEffect(() => {
        if (!session) {
            // Session is null, handle the case appropriately
            return;
        }
        console.log("userResponses changed:", JSON.stringify(responses));
        // Count the number of responses for the current question
        
        const numResponses = responses.filter((response) => response.questionIndex === currentQuestionIndex).length;
        console.log(`num responses: ${numResponses}, num participants: ${session.participants.length}`);
        // Check if all participants have answered
        if (numResponses === session.participants.length) {
            // Move to the next question
            console.log("all participants answered! going to the next question !");
            goToNextQuestion();
        }
    }, [responses]);
    
    
    const handleAnswerChange = (index) => {
        // Update user's answer based on the selected option
        setUserAnswer((prevAnswer) => {
            if (question && question.isMultipleAnswerAllowed) {
                // If multiple answers are allowed, toggle the selected option
                if (prevAnswer.includes(index)) {
                    // If the option is already selected, remove it
                    return prevAnswer.filter((ans) => ans !== index);
                } else {
                    // Otherwise, add it to the answer list
                    return [...prevAnswer, index];
                }
            } else {
                // If only single answer is allowed, replace the current answer with the selected option
                return [index];
            }
        });
    };
    
    useSessionStartedListener(connection, handleSessionStarted);

    useSessionUpdatedListener(connection, handleSessionUpdated);

    const joinSession = async (nickname) => {
        try{
            console.log(`JoinSession: user nickname is ${nickname}, want to join : ${session.sessionID}`)
            await SessionService.joinSession(session.sessionID, nickname);
            console.log("finish joinSession with SessionService ");
            console.log("Notify other participants about the new user with sessionId ");

            setNickname(nickname);
            connection.invoke("UserJoined", session.sessionID, nickname);

        }catch(e){
            console.log(e);
        }
       
    };

    // Function to handle moving to the next question
    const goToNextQuestion = () => {
        console.log(`goToNextQuestion`);
        if (currentQuestionIndex < quiz.questions.length - 1) {
            console.log(`current question is ${currentQuestionIndex}, going to next question.. `);
            setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        }
        else{
            console.log(`no more questions! finish:) `);
            connection.invoke('SessionFinished', sessionId);
            setSessionFinished(true);

        }
    };

    const handleAnswerSubmit = () => {
        // Create a new user response object based on the current state
        // TODO: Implement server-side validation to check the correctness of the user's answer
        // and update the 'isCorrect' field accordingly.
        console.log("handle answer submit");
        console.log("startTime:", startTime); // Log startTime to check its value
        var timeTaken = Date.now() - startTime; // Calculate the time taken in milliseconds
        console.log("Date.now():", Date.now()); // Log the result of Date.now()
        console.log("timeTaken:", timeTaken); // Log timeTaken to check if it's NaN

        const answerSubmissionDto = {
            // Copy existing fields from userResponse
            // Add or update fields specific to the current question
            sessionId: session.sessionID,
            nickname: nickname,
            questionIndex: currentQuestionIndex,
            selectedOptions: userAnswer,
            timeTaken:timeTaken

        };
        console.log("want tot submit answer:", JSON.stringify(answerSubmissionDto));
        
        SessionService.submitAnswer(answerSubmissionDto);

    };
    
    
    // Handler for the "QuestionResponseSubmitted" event
    const handleQuestionResponseSubmitted = async (nickname, questionIndex, isCorrect) => {
        console.log(`Received QuestionResponseSubmitted for ${nickname}, QuestionIndex: ${questionIndex}, IsCorrect: ${isCorrect}`);
        // Handle the event data as needed
        // For example, you can update UI or perform other actions based on the received data
        // Here, you can update state, display notifications, etc.
        // Add the new user response to the list
        const newResponse = {
            nickname: nickname,
            questionIndex:questionIndex,
            isCorrect:isCorrect
        };
        
        setResponses(prevResponses => [...prevResponses,newResponse ]);
    };

    // Custom hook to listen for "QuestionResponseSubmitted" event
    useQuestionResponseSubmittedListener(connection, handleQuestionResponseSubmitted);
    // useEffect to re-render the question when currentQuestionIndex changes

  useEffect(() => {
        // Fetch or set the question based on the updated currentQuestionIndex
        // Replace the following line with your logic to get the question data
        if(quiz != null && quiz.questions != null){
            const newQuestion = quiz.questions[currentQuestionIndex];
            console.log(`setting new question: ${newQuestion}`);
            setQuestion(newQuestion);
            setStartTime(Date.now);
            
        }
        else{
            console.log(`quiz or quiz questions is null`);
        }
    
    }, [quiz, currentQuestionIndex]); // Dependency array ensures the effect runs when currentQuestionIndex changes
    
    useEffect(() => {
        console.log(`session change !! ${session}`);
        if(session){
            setSessionStarted(SessionService.isSessionStarted(session));
            setSessionFinished(SessionService.isSessionFinished(session));
        }
    }, [session])

  useEffect(() => {
        setUserAnswer([]); // Reset user's choice
    }, [question])
   
    useEffect(() => {
        console.log("leaderboardata :", leaderboardData);

    }, [leaderboardData])
  
    useEffect(() => {
        const fetchLeaderboardData = async () => {
            try {
                console.log("fetchleaderboardata:")
                const data = await SessionService.fetchSessionResults(sessionId); // Fetch leaderboard data from your backend service
                console.log("sessionresults fetched:", data );
                setLeaderboardData(data); // Update leaderboard data state
            } catch (error) {
                console.error('Error fetching leaderboard data:', error);
            }
        };

        if (isSessionFinished) {
            fetchLeaderboardData(); // Fetch leaderboard data when the session is finished
        }
    }, [isSessionFinished]);


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
    
    if(!isSessionStarted){
        return (
            <div>
                <WaitingRoom
                    sessionHubConnection = {connection}
                    session={session}
                    onStartSession={startSession}
                    onJoinSession={joinSession}
                />
            </div>


        )
    }

    if (isSessionFinished) {
        // Render leaderboard
        return (
            <div>
                <h1>Session {session.name}</h1>
                <p>Session Finished!</p>
                <Leaderboard 
                    leaderboardData={leaderboardData} 
                    isHost={isHost}
                />
            </div>
        );
    }

    
    if (isHost(session)) {
        return (
            <div>
                <h1>Session {session.name}</h1>
                <p>Welcome, {AuthService.getSessionUsername()}</p>
                <SessionAdminStatistics 
                    responses={responses}
                />
            </div>
        );
    }

    
    if (quiz == null){
        return (
            <p>Loading quiz...</p>
        )
    }

    if (quiz.questions == null){
        return (
            <p>Loading questions...</p>
        )
    }

    return (
        <div>
            <h1>Session {session.name}</h1>
            <p>Welcome, {nickname}</p>
            <p>Question {currentQuestionIndex + 1} / {quiz.questions.length }</p>
            {question?(
                <QuizQuestion
                    question={question}
                    userAnswer={userAnswer}
                    handleAnswerChange={handleAnswerChange}
                    handleAnswerSubmit={handleAnswerSubmit}
                />) 
            :(
                <p>Loading quiz...</p>
            )}
        </div>
    );
};

export default SessionPage;
