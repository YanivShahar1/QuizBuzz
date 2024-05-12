import { useNavigate } from 'react-router-dom';
import AuthService from '../services/AuthService';


// Custom hook for authentication check
const useRequireAuth = () => {
    const navigate = useNavigate();

    // Check if user is authenticated
    const isAuthenticated = AuthService.isAuthenticated();

    // Redirect to login page if not authenticated
    if (!isAuthenticated) {
        navigate('/login'); // Redirect to login page
    }

    return isAuthenticated; // Return authentication status
};

export default useRequireAuth;
