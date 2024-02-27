import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionService from '../../../services/SessionService';
import QuizService from '../../../services/QuizService';
import AuthService from '../../../services/AuthService';


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

    console.log(`create session page: username is ${userName}`);
    const [sessionName, setSessionName] = useState('');
    const [selectedQuiz, setSelectedQuiz] = useState('');
    const [maxTimePerQuestion, setMaxTimePerQuestion] = useState('');
    const [maxParticipants, setMaxParticipants] = useState('');
    const navigate = useNavigate();
    const [userQuizzes, setUserQuizzes] = useState([]);

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

    const handleCreateSession = async () => {
        try {
            // Validate sessionName, selectedQuiz, maxTimePerQuestion, and maxParticipants
            if (!sessionName || !selectedQuiz || !maxTimePerQuestion || !maxParticipants) {
                // Handle validation error
                return;
            }

            // Create session object
            const newSession = {
                name: sessionName,
                associatedQuizID: selectedQuiz.quizID,
                maxTimePerQuestion: parseInt(maxTimePerQuestion),
                maxParticipants: parseInt(maxParticipants),
                hostUserId: userName,
                // Add other session properties as needed
            };

            // Call the API to create a new session
            const sessionId = await SessionService.createSession(newSession);

            // Redirect to the waiting room for the session
            navigate(`/waiting-room/${sessionId}`);
        } catch (error) {
            console.error('Error creating session:', error);
            // Handle error (e.g., display error message to user)
        }
    };

    return (
        <div>
            <h2>Create Session</h2>
            <form onSubmit={handleCreateSession}>
                <div>
                    <label>Session Name:</label>
                    <input
                        type="text"
                        value={sessionName}
                        onChange={(e) => setSessionName(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Select Quiz:</label>
                    <select
                        value={selectedQuiz}
                        onChange={(e) => setSelectedQuiz(e.target.value)}
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
                        value={maxTimePerQuestion}
                        onChange={(e) => setMaxTimePerQuestion(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Max Participants:</label>
                    <input
                        type="number"
                        value={maxParticipants}
                        onChange={(e) => setMaxParticipants(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Create Session</button>
            </form>
        </div>
    );
};

export default CreateSessionPage;
