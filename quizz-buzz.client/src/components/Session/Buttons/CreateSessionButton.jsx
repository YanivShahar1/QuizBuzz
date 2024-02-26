// CreateQuizButton.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CreateSessionButton.module.css'; // Import CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle, faPlay } from '@fortawesome/free-solid-svg-icons';



const CreateSessionButton = () => {
    return (
        <>
            <Link to="/create-session" className={styles.button}>Create Session</Link>
        </>
        
    );
};

export default CreateSessionButton;
