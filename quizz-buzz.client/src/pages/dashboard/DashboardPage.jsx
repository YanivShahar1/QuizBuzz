import { Link } from 'react-router-dom';
import QuizzesSection from './QuizzesSection';
import AuthService from '../../services/AuthService';
import './DashboardPage.css';
import React, { useState, useEffect } from 'react';

const DashboardPage = () => {
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

    return (
        <div className="dashboard-container">
            {userName ? (
                <div>
                    <h1>Welcome, {userName}!</h1>
                    <QuizzesSection userName={userName} />
                    {/* Include other sections here */}
                </div>
            ) : (
                <h1>Please log in to access your dashboard</h1>
            )}
        </div>
    );
};

export default DashboardPage;
