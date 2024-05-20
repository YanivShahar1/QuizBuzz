import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, json } from 'react-router-dom';
import SessionResults from '../../components/Session/SessionResults/SessionResults';
import SessionService from '../../services/SessionService';
import QuizService from '../../services/QuizService';
import AuthService from '../../services/AuthService';
import WaitingRoom from './WaitingRoom';
import QuizQuestion from '../../components/Quiz/QuizQuestion';
import useSessionHub from '../../hooks/signalR/useSessionHub';
import SessionAdminStatistics from '../../components/Session/SessionAdminStatistics';
import useSessionStartedListener from '../../hooks/signalR/useSessionStartedListener';
import useSessionFinishedListener from '../../hooks/signalR/useSessionFinishedListener';
import useNextQuestionListener from '../../hooks/signalR/useNextQuestionListener'
import useSessionUpdatedListener from '../../hooks/signalR/useSessionUpdatedListener'
import useUserResponseSubmittedListener from '../../hooks/signalR/useUserResponseListener';


const SessionPage = () => {
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [isSessionStarted, setSessionStarted] = useState(false);
    const [isSessionFinished, setSessionFinished] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [nickname, setNickname] = useState(null);
    const [responses, setResponses] = useState([]);
    const [startTime, setStartTime] = useState(null);
    const [leaderboardData, setLeaderboardData] = useState([]); 
    const connection = useSessionHub();
    
    const subscribeToSessionGroup = () => {
        if(connection!=null && session != null){
            console.log("connection is not null, invoke JoinSessionGroup");
            connection.invoke("JoinSessionGroup", session.sessionID);
        }else{
            console.log(`connection or session is null`);
        }
    }

    const subscribeToAdminGroup = () => {
        if(connection!=null && session != null){
            console.log("connection is not null, invoke JoinAdminGroup");
            connection.invoke("JoinAdminGroup",session.sessionID, AuthService.getSessionUsername());
            return true;
        }else{
            console.log(`connection is null`);
            return false;
        }
    }

    useEffect(() => {
        const storedNickname = JSON.parse(window.sessionStorage.getItem("nickname"));
        if (storedNickname !== null) {
            console.log(`found nickname in sessionstorage: ${storedNickname}`);
            setNickname(storedNickname);
        }
    });
    
    useEffect(() => {
        fetchSessionData();
    }, [sessionId]);

    useEffect(() => {
        console.log(`session has changed !! ${JSON.stringify(session)}`);
        if(session){
            if(SessionService.isSessionStarted(session)){
                setSessionStarted(true);
            }
            if(SessionService.isSessionFinished(session)){
                setSessionFinished(true);
            }
            subscribeToSessionGroup();
            if(SessionService.isCurrentUserSessionHost(session)){
                subscribeToAdminGroup();
            }
        }
        else{
            console.log(`session is null`);
        }
    }, [session])

    useEffect(() => {
        console.log(`session has changed !! ${JSON.stringify(session)}`);
        if(quiz){
            console.log(`quiz has changed: ${JSON.stringify(quiz)}`);

        }
        else{
            console.log(`quiz is null`);
        }
    }, [quiz])
    useEffect(() => {

        console.log(`isSessionFinished = ${isSessionFinished}, isSessionStarted= ${isSessionStarted}`);

    },[isSessionFinished, isSessionStarted])
    // useEffect to re-render the question when currentQuestionIndex changes
    useEffect(() => {
        setStartTime(Date.now);
        setUserAnswer([]); // Reset user's choice

        console.log(`question index changed: ${currentQuestionIndex}`);
    }, [currentQuestionIndex]); 
    
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
            fetchSessionData();
        }
    }, [isSessionFinished]);

    

    const fetchSessionData = async () => {
        try {
            console.log("fetching session data");
            const sessionData = await SessionService.fetchSession(sessionId);
            await setSession(sessionData);
            
            //If quiz is not set or new sessionId,fetch quiz of the new session
            if (!quiz || sessionData?.sessionID != sessionId ) {
                const fetchedQuiz = await QuizService.fetchQuiz(sessionData.associatedQuizID);
                setQuiz(fetchedQuiz);
                console.log("quiz is set");
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            // Handle error (e.g., redirect to error page)
        }
    };

    const startSession = async () => {
        try {

            //Todo, always host.. so just call start seesion of session service
            if(SessionService.isCurrentUserSessionHost(session)){
                console.log("in startSession-< HOST!");

                await SessionService.startSession(sessionId);       
            }
            else{
                console.log("in startSession-< not host...............");

            }

            setSessionStarted(true);
        } catch (error) {
            console.error('Error starting session:', error);
            // Handle error (e.g., show error message to user)
        }
    };


    const handleSessionStarted = async () => {
        try {
            // Call API to start the session
            console.log("handleSessionStarted");
            
            // Update session state to indicate session has started
            // Fetch session participants and update the session state
            const sessionParticipants = await SessionService.getParticipants(session.sessionID);
            await setSession(prevSession => ({
                ...prevSession,
                participants: sessionParticipants
            }));
            setSessionStarted(true);
            console.log(`started!:, quiz : ${JSON.stringify(quiz)})`);
            
        } catch (error) {
            console.error('Error in handle session started:', error);
            // Handle error (e.g., show error message to user)
        }
    };

    const handleSessionFinished = async () => {
        try {
            // Call API to start the session
            console.log("handleSessionFinished");
            setSessionFinished(true);
            
        } catch (error) {
        }
    };
    
    const handleAnswerChange = (index) => {
        // Update user's answer based on the selected option
        setUserAnswer((prevAnswer) => {
            if (quiz.questions[currentQuestionIndex].isMultipleAnswerAllowed) {
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

    const handleNewResponseSubmited = (nickname, questionIndex, response) => {
        const newResponse = {
            ...response,
            questionIndex,
        };
        console.log(`user ${nickname} response for question: ${questionIndex}, : ${JSON.stringify(newResponse)}`)
        setResponses(prevResponses => [...prevResponses, newResponse]);
    };

    useUserResponseSubmittedListener(connection, handleNewResponseSubmited);
    
    useSessionStartedListener(connection, handleSessionStarted);
    useSessionFinishedListener(connection, handleSessionFinished);

    const joinSession = async (nickname) => {
        try{
            console.log(`JoinSession: user nickname is ${nickname}, want to join : ${session.sessionID}`)
            await SessionService.joinSession(session.sessionID, nickname);
            setNickname(nickname);

        }catch(e){
            console.log(e);
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
    const handleNextQuestion = async (questionIndex) => {
        console.log(`Received handleNextQuestion for QuestionIndex: ${questionIndex}`);
        setCurrentQuestionIndex(questionIndex);
    };
    // Custom hook to listen for "QuestionResponseSubmitted" event
    useNextQuestionListener(connection, handleNextQuestion);
    

    
    if (connection == null){
        return (
            <p>Loading connection...</p>
        )
    }

    if (session == null){
        return (
            <p>Loading session...</p>
        )
    }
    
    if (isSessionFinished) {
        return (
            <div>
                <h1>Session {session.name}</h1>
                <p>Session Finished!</p>
                <SessionResults 
                    data={leaderboardData} 
                    isHost={SessionService.isCurrentUserSessionHost(session)}
                />
            </div>
        );
    }
   
    
    if(!isSessionStarted){
        return (
            <div>
                <WaitingRoom
                    sessionHubConnection = {connection}
                    sessionId={sessionId}
                    isHost={SessionService.isCurrentUserSessionHost(session)}
                    onStartSession={startSession}
                    onJoinSession={joinSession}
                    nickname={nickname}
                    setNickname={setNickname}
                />
            </div>


        )
    }

    

    
    if (SessionService.isCurrentUserSessionHost(session)) {
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
            {quiz.questions?(
                <QuizQuestion
                    question={quiz.questions[currentQuestionIndex]}
                    userAnswer={userAnswer}
                    handleAnswerChange={handleAnswerChange}
                    handleAnswerSubmit={handleAnswerSubmit}
                />) 
            :(
                <p>Loading questions...</p>
            )}
        </div>
    );
};

export default SessionPage;
