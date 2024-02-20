// Home.jsx

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faPlay } from '@fortawesome/free-solid-svg-icons';
import AuthService from '../services/AuthService';
import QuizService from '../services/QuizService';
import './HomePage.css';  // Import the CSS file
import CreateQuizButton from '../components/Quiz/Buttons/CreateQuizButton';


const HomePage = () => {
    const [username, setUsername] = useState(AuthService.getSessionUsername());
   

    const [quizId, setQuizId] = useState('');
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState('');

    const handleQuizIdChange = (event) => {
        console.log(event.target.value);

        setQuizId(event.target.value);
        setErrorMessage(''); 
    };

    const handleEnterQuizClick = async () => {
        try {
            console.log(`Checking if quiz with ID ${quizId} existssss...`);

            if (quizId.trim() === '') {
                setErrorMessage('Quiz ID cannot be empty.');
                return; 
            }

            // Use QuizService to check if the quiz exists
            const quiz = await QuizService.fetchQuiz(quizId);
            console.log("quiz:", quiz);
            const exists = quiz != null;

            if (exists) {
                // The quiz exists, navigate to it
                console.log(`Navigating to quiz with ID ${quizId}`);
                navigate(`/quiz/${quizId}`);
            } else {
                // The quiz does not exist
                setErrorMessage(`Quiz with ID ${quizId} does not exist. Please enter a valid Quiz ID.`);
            }
        } catch (error) {
            console.error('Error in handleEnterQuizClick:', error);
            setErrorMessage('Error checking quiz existence. Please try again.');
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
            <div className="enter-quiz-section">
                <div className="enter-quiz-input">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Quiz ID"
                        value={quizId}
                        onChange={handleQuizIdChange}
                    />
                    {errorMessage && <p className="error-message">{errorMessage}</p>}

                </div>
                <button className="btn-enter-quiz" type="button" onClick={handleEnterQuizClick}>
                    <FontAwesomeIcon icon={faPlay} className="mr-2" />
                    Enter Quiz
                </button>
            </div>
            <div className="create-quiz-section">
                {username ? (
                    <CreateQuizButton/>
                ) : (
                    <div>
                        <button className="btn-create-quiz" disabled>
                            <FontAwesomeIcon icon={faPlusCircle} className="mr-2" />
                            Create Quiz
                        </button>
                        <p className="text-muted">
                            Only logged-in users can create quizzes.
                            <Link to="/login"> Log In</Link> or <Link to="/signup">Sign Up</Link>
                        </p>
                    </div>
                )}
            </div>

        </div>
    );
}

export default HomePage;
