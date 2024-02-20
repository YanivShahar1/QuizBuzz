// ErrorPage.js

import React from 'react';
import { Link } from 'react-router-dom';
import './ErrorPage.css'; // Import the CSS file

const ErrorPage = ({ errorMessage }) => {
    return (
        <div className="error-container">
            <h2>Oops! Something went wrong</h2>
            <p className="error-message">Error: {errorMessage}</p>
            <Link to="/" className="home-link">Go to Home Page</Link>
        </div>
    );
};

export default ErrorPage;
