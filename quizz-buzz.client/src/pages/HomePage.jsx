// Home.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faPlay } from '@fortawesome/free-solid-svg-icons';
import AuthService from '../services/AuthService';
import './HomePage.css';  // Import the CSS file
import CreateSessionButton from '../components/Session/Buttons/CreateSessionButton';
import SessionService from '../services/SessionService';

const HomePage = () => {
    const [username, setUsername] = useState(AuthService.getSessionUsername());
   

    const [sessionId, setSessionId] = useState('');
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleSessionIdChange = (event) => {
        console.log(event.target.value);

        setSessionId(event.target.value);
        setErrorMessage(''); 
    };

    const handleEnterSessionClick = async () => {
        try {
            console.log(`Checking if session with ID ${sessionId} existssss...`);

            if (sessionId.trim() === '') {
                setErrorMessage('Session ID cannot be empty.');
                return; 
            }

            // Use QuizService to check if the quiz exists
            const session = await SessionService.fetchSession(sessionId);
            console.log("session:", session);
            const exists = session != null;

            if (exists) {
                // The quiz exists, navigate to it
                console.log(`Navigating to session with ID ${sessionId}`);
                navigate(`/session/${sessionId}`);
            } else {
                // The quiz does not exist
                setErrorMessage(`Session with ID ${sessionId} does not exist. Please enter a valid Session ID.`);
            }
        } catch (error) {
            console.error('Error in handleEnterSessionClick:', error);
            setErrorMessage('Error checking session existence. Please try again.');
        }
    };

    useEffect(() => {
        const loginStatusChangeListener = () => {
            const loggedInUsername = AuthService.getSessionUsername();
            setUsername(loggedInUsername);
        };

        loginStatusChangeListener(); // Initial check

        AuthService.subscribeToLoginStatusChange(loginStatusChangeListener);

        return () => {
            AuthService.unsubscribeFromLoginStatusChange(loginStatusChangeListener);
        };
    }, []);

    return (
        <div className="homepage-container">
            <div className="enter-session-section">
                <div className="enter-session-input">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Session ID"
                        value={sessionId}
                        onChange={handleSessionIdChange}
                    />
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                </div>
                <button className="btn-enter-session" type="button" onClick={handleEnterSessionClick}>
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Enter Session
                </button>
            </div>
            <div className="create-session-section">
                {username ? (
                    <CreateSessionButton/>
                ) : (
                    <div>
                        <p className="text-muted">
                            Only logged-in users can create new session.
                            <Link to="/login"> Log In</Link> or <Link to="/signup">Sign Up</Link>
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}

export default HomePage;
