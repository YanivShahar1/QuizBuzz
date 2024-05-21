import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';
import { useEffect } from 'react';

// Custom hook for authentication check
const useRequireAuth = () => {
    console.log("useRequireAuth")
    const navigate = useNavigate();
    // Check if user is authenticated
    const sessionUserName = AuthService.getSessionUsername();
    useEffect(()=>{
        console.log(`sessionUserName = ${sessionUserName}`);
        // Redirect to login page if not authenticated
        if (!sessionUserName) {
            console.log("null");
            navigate('/login'); // Redirect to login page
            return false;
        }
        console.log("ddd");

    },sessionUserName)
    

    return true; // Return authentication status
};

export default useRequireAuth;
