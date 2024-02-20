import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const EnterQuizPage = () => {
    const [quizId, setQuizId] = useState('');

    // Replace useHistory with useNavigate
    const navigate = useNavigate();

    
    const handleInputChange = (event) => {
        setQuizId(event.target.value);
    };

    const handleEnterClick = () => {
        if (quizId.length >0) {
            // Use navigate instead of history.push
            navigate(`/quiz/${quizId}`);
        } else {
            console.error('Invalid quizId. Please enter a valid quizId.');
        }
    };

    return (
        <div className="container mt-5">
            <h2>Enter Quiz</h2>
            <div className="input-group mb-3">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Quiz ID"
                    value={quizId}
                    onChange={handleInputChange}
                />
                <div className="input-group-append">
                    <button className="btn btn-primary" type="button" onClick={handleEnterClick}>
                        Enter
                    </button>
                </div>
            </div>
        </div>
    );
}

export default EnterQuizPage;
