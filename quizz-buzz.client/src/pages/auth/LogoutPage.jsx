import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../services/AuthService'; // Replace with the actual path to your AuthService file
const LogoutPage = () => {
    const navigate = useNavigate();

    // useEffect to handle the logout logic on component mount
    useEffect(() => {
        // Call the logout method from AuthService to clear authentication
        AuthService.logout();

        // Navigate to the home page or login page after logout
        navigate('/');
    }, [navigate]);

    return null; // or render a message if needed
};

export default LogoutPage;
