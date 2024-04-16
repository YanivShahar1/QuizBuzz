// CreateSessionButton.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CreateSessionButton.module.css'; // Import CSS module
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';

const CreateSessionButton = () => {
    return (
        <Link to="/create-session" className={styles.button}>
            <FontAwesomeIcon icon={faPlusCircle} className={styles.icon} />
            Create Session
        </Link>
    );
};

export default CreateSessionButton;
