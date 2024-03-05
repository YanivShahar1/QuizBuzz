import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionService from '../../../services/SessionService';
import QuizService from '../../../services/QuizService';
import AuthService from '../../../services/AuthService';

import { Accordion, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';

const CreateSessionPage = () => {
    const [userName, setUserName] = useState(AuthService.getSessionUsername()); // Initialize userName with getSessionUsername

    useEffect(() => {
        // Listen for login/logout events
        const loginStatusChangeListener = () => {
            const loggedInUserName = AuthService.getSessionUsername();
            setUserName(loggedInUserName); // Set userName state
        };

        // Initial check when the component mounts
        loginStatusChangeListener();

        // Subscribe to authentication changes
        AuthService.subscribeToLoginStatusChange(loginStatusChangeListener);

        // Cleanup function
        return () => {
            // Unsubscribe from authentication changes when the component unmounts
            AuthService.unsubscribeFromLoginStatusChange(loginStatusChangeListener);
        };
    }, []);

    useEffect(() => {sessionInfo.hostUserId = userName},[userName]);

    console.log(`create session page: username is ${userName}`);
    const [ loading, setLoading ] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        hostUserId: '',
        name: '',
        associatedQuizID: '',
        maxTimePerQuestion: '60',
        maxParticipants: '20',
      });
    
    const handleInfoChange = (newInfo) => {
        setSessionInfo(newInfo);
    };
    useEffect(() => {
        console.log('Host User ID:', sessionInfo.hostUserId);
        console.log('Name:', sessionInfo.name);
        console.log('Associated Quiz ID:', sessionInfo.associatedQuizID);
        console.log('Max Time Per Question:', sessionInfo.maxTimePerQuestion);
        console.log('Max Participants:', sessionInfo.maxParticipants);
    }, [sessionInfo]);
    const navigate = useNavigate();
    const [userQuizzes, setUserQuizzes] = useState([]);
    const [error, setError] = useState(null);


    useEffect(() => {
        const fetchUserQuizzes = async () => {
            try {
                const quizzes = await QuizService.fetchUserQuizzes(userName);
                setUserQuizzes(quizzes);
            } catch (error) {
                console.error('Error fetching user quizzes:', error);
            }
        };

        fetchUserQuizzes();
    }, [userName]);

    const handleSubmitSession = async () => {
        try {
            setLoading(true);

            console.log(`in handle create session`);
            // Validate sessionName, selectedQuiz, maxTimePerQuestion, and maxParticipants
            if (!sessionInfo.name || !sessionInfo.associatedQuizID || !sessionInfo.maxTimePerQuestion || !sessionInfo.maxParticipants) {
                setError('Please fill in all fields.');
                return;
            }
            console.log(`legal name quiz and other`);


            // Create session object
            
            console.log(`want to submit session : ${sessionInfo}`);
            

            // Call the API to create a new session
            const sessionId = await SessionService.submitSession(sessionInfo);
            alert(`Session submitted successfully! Session ID: ${sessionId}`);

            // Redirect to the waiting room for the session
            console.log(`navigating to waiting room /sessionId`);
            navigate(`/waiting-room/${sessionId}`);
        } catch (error) {
            setError(`error when submitting new session : error : ${error.response ? error.response.data : error.message}`);
        }
    };
    const canSubmit = () => {
        return 1;
        //return questions.length > 0 && questions.every(question => question.correctAnswers.length > 0 && question.options.length >= 2);
    };
    return (
        <div>
            <h2>Create Session</h2>
            
            <form onSubmit={handleSubmitSession}>
                <div>
                    <label>Session Name:</label>
                    <input
                        type="text"
                        placeholder='Enter session name'
                        value={sessionInfo.name}
                        onChange={(e) => handleInfoChange({ ...sessionInfo, name: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label>Select Quiz:</label>
                    <select
                        value={sessionInfo.associatedQuizID}
                        onChange={(e) => handleInfoChange({ ...sessionInfo, associatedQuizID: e.target.value })}
                        required
                    >
                        <option value="">Select a Quiz</option>
                        {userQuizzes.map(quiz => (
                            <option key={quiz.quizID} value={quiz.quizID}>{quiz.title}</option>
                        ))}
                    </select>
                </div>
                <div>
                    <label>Max Time Per Question (seconds):</label>
                    <input
                        type="number"
                        value={sessionInfo.maxTimePerQuestion}
                        onChange={(e) => handleInfoChange({ ...sessionInfo, maxTimePerQuestion: e.target.value })}
                        required
                    />
                </div>
                <div>
                    <label>Max Participants:</label>
                    <input
                        type="number"
                        value={sessionInfo.maxParticipants}
                        onChange={(e) => handleInfoChange({ ...sessionInfo, maxParticipants: e.target.value })}
                        required
                    />
                </div>
                 {/* Error message section */}
                 {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
                {/* <button type="submit">Submit Session</button> */}
                {canSubmit() && (
                            <Button variant="success" className="mt-3" onClick={handleSubmitSession}>
                                {loading ? 'Submitting...' : 'Submit Session'}
                            </Button>
                        )}
            </form>
        </div>
    );
};

export default CreateSessionPage;
