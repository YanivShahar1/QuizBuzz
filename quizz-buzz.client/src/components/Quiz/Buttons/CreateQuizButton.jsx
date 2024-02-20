// CreateQuizButton.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CreateQuizButton.module.css'; // Import CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faPlay } from '@fortawesome/free-solid-svg-icons';



const CreateQuizButton = () => {
    return (
        <>
            <Link to="/create-quiz" className={styles.button}>Create Quiz</Link>
        </>
        
    );
};

export default CreateQuizButton;
