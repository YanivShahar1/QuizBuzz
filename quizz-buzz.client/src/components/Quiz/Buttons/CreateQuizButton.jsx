// CreateQuizButton.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import './CreateQuizButton.css'; // Import regular CSS file
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

const CreateQuizButton = () => {
    return (
        <Link to="/create-quiz" className="create-quiz-button">
            <FontAwesomeIcon icon={faPlusCircle} className="create-quiz-icon" />
            Create Quiz
        </Link>
    );
};

export default CreateQuizButton;
