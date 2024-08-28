import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { useEffect, useState } from 'react';

// Custom hook for authentication check
const useRequireAuth = () => {
    const navigate = useNavigate();
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        const username = AuthService.getCurrentLogedInUsername();
        console.log(`user name = ${username}`);
        
        if (!username) {
            console.log("no logged in user");
            navigate('/login'); // Redirect to login page
        } else {
            setIsAuthenticated(true);
        }
    }, [navigate]);

    return isAuthenticated; // Return the actual authentication status
};

export default useRequireAuth;
