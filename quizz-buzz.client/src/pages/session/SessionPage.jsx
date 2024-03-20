import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionService from '../../services/SessionService';
import QuizService from '../../services/QuizService';
import AuthService from '../../services/AuthService';
import WaitingRoom from './WaitingRoom';
import QuizQuestion from '../../components/Quiz/QuizQuestion';
import useSessionHub from '../../signalR/useSessionHub';
import SessionAdminStatistics from '../../components/Session/SessionAdminStatistics';
import useUserResponseSubmittedListener from '../../signalR/useUserResponseSubmittedListener';
import useSessionStartedListener from '../../signalR/useSessionStartedListener';


const SessionPage = () => {
    const INITIAL_TIMER_VALUE = 60;

    const connection = useSessionHub();
    const { sessionId } = useParams();
    const [session, setSession] = useState(null);
    const [isSessionStarted, setSessionStarted] = useState(false);
    const [isSessionFinished, setSessionFinished] = useState(false);
    const [userAnswer, setUserAnswer] = useState([]);
    const [timer, setTimer] = useState(INITIAL_TIMER_VALUE);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [quiz, setQuiz] = useState(null);
    const [question, setQuestion] = useState(null);
    const [nickname, setNickname] = useState(null);
    const [userResponses, setUserResponses] = useState([]);
    
    const isHost = () => {
        if (session) {
            return session.hostUserID === AuthService.getSessionUsername();
        }
        return false; // Return false if session is null
    };

    useEffect(() => {
        let intervalId;

        if (isSessionStarted && timer > 0) {
            intervalId = setInterval(() => {
                setTimer((prevTimer) => prevTimer - 1);
            }, 1000);
        }

        // If timer reaches zero and session has started, increment currentQuestionIndex
        if (timer === 0 && isSessionStarted) {
            goToNextQuestion();
        }

        return () => clearInterval(intervalId);
    }, [isSessionStarted, timer]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const sessionData = await SessionService.fetchSession(sessionId);
                setSession(sessionData);
                console.log("session is set");
                
                if (sessionData?.associatedQuizID) {
                    const fetchedQuiz = await QuizService.fetchQuiz(sessionData.associatedQuizID);
                    setQuiz(fetchedQuiz);
                    console.log("quiz is set");
                    connection.invoke("UserJoined", session.sessionID,session.hostUserID );
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error (e.g., redirect to error page)
            }
        };
    
        fetchData();

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
        if (!session) {
            // Session is null, handle the case appropriately
            return;
        }
        console.log("userResponses changed:", JSON.stringify(userResponses));
        // Count the number of responses for the current question
        const numResponses = userResponses.filter(response => response.questionIndex === currentQuestionIndex).length;
        console.log(`num responses: ${numResponses}, num participants: ${session.participants.length}`);
        // Check if all participants have answered
        if (numResponses === session.participants.length) {
            // Move to the next question
            console.log("all participants answered! going to the next question !");
            goToNextQuestion();
        }
    }, [userResponses]);
    
    const handleUserResponseSubmitted = async (userResponse) => {
        // Here, you can implement the logic to count the number of players who answered the current question
        // For example, you can maintain a list of user responses and check the length against the total number of participants
        // Once all participants have answered, you can proceed to the next question
    
        // Update the list of user responses or perform any necessary calculations
        // For now, let's assume we have a list of user responses stored in state
        // and we check if the number of responses equals the total number of participants
    
        // Assuming you have a state variable 'userResponses' to store user responses
        // and 'session.participants' to get the total number of participants
        // Replace these with your actual state variables

         // Add the new user response to the list
        console.log("received a new response !");
        console.log(`user response: ${ JSON.stringify(userResponse)}`);
        setUserResponses(prevResponses => [...prevResponses, userResponse]);
        console.log(`updated nw user responses list : ${JSON.stringify(userResponses)}`)
        
    };

    useUserResponseSubmittedListener(connection, handleUserResponseSubmitted);

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
            setSessionFinished(true);

        }
    };

    const handleAnswerSubmit = () => {
        // Create a new user response object based on the current state
        // TODO: Implement server-side validation to check the correctness of the user's answer
        // and update the 'isCorrect' field accordingly.
        
        console.log("handle answer submit");
        // Get the correct options for the current question
        const correctOptions = quiz.questions[currentQuestionIndex].correctOptions;

        // Check if the user's answer matches the correct options
        const isCorrect = JSON.stringify(userAnswer.sort()) === JSON.stringify(correctOptions.sort());

        const newUserResponse = {
            // Copy existing fields from userResponse
            // Add or update fields specific to the current question
            sessionID: session.sessionID,
            nickname: nickname,
            questionIndex: currentQuestionIndex,
            selectedOptions: userAnswer,
            isCorrect : isCorrect, 
            // Other fields...
        };
        console.log("want tot submit newUserResponse:", JSON.stringify(newUserResponse));
        
        SessionService.submitAnswer(newUserResponse);

    };
    
    // useEffect to re-render the question when currentQuestionIndex changes
  useEffect(() => {
    // Fetch or set the question based on the updated currentQuestionIndex
    // Replace the following line with your logic to get the question data
    if(quiz != null && quiz.questions != null){
        const newQuestion = quiz.questions[currentQuestionIndex];
        console.log(`setting new question: ${newQuestion}`);
        setQuestion(newQuestion);
        setTimer(INITIAL_TIMER_VALUE);
    }
    else{
        console.log(`quiz or quiz questions is null`);
    }
   
  }, [quiz, currentQuestionIndex]); // Dependency array ensures the effect runs when currentQuestionIndex changes

  useEffect(() => {
    setUserAnswer([]); // Reset user's choice
  }, [question])


  
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
    // console.log("session page Responses:", JSON.stringify(userResponses));

    
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
    
    if (isHost(session)) {
        return (
            <div>
                <h1>Session {session.name}</h1>
                <p>Welcome, {AuthService.getSessionUsername()}</p>
                <SessionAdminStatistics 
                    responses={userResponses}
                />
            </div>
        );
    }

    if (isSessionFinished) {
        // Render leaderboard
        return (
            <div>
                <h1>Session {session.name}</h1>
                <p>Session Finished!</p>
                {/* Render leaderboard */}
            </div>
        );
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
                    timer={timer}
                />) 
            :(
                <p>Loading quiz...</p>
            )}
        </div>
    );
};

export default SessionPage;
