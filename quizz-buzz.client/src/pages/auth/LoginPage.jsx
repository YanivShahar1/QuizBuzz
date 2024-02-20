// Login.jsx
import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import './LoginPage.css'; // Import CSS file
import PasswordInput from '../../components/PasswordInput';


const Login = () => {
    const navigate = useNavigate();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [rememberMe, setRememberMe] = useState(false); // State for "stay logged in" checkbox


    const handleLogin = async () => {
        try {
            console.log(`user ${username} want to login with password ${password}`);
            await AuthService.authenticate(username, password, rememberMe);
            console.log(`user ${ username } is logged in `);
            navigate('/dashboard'); 
        } catch (error) {
            console.error('Login failed', error.message);
            setErrorMessage(error.message); 
        }
    };

    return (
        <div className="login-container">
            <h2>Login</h2>
            <div className="login-form">
                <label>
                    Username:
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                </label>
                <br />
                <label>
                    Password:
                    <PasswordInput value={password} onChange={setPassword} />
                </label>
                <label>
                    <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} />
                    Remember me
                </label>
                {errorMessage && <div className="error-msg" > {errorMessage}</div>} {/* Display error message */}
                <br />
                <button onClick={handleLogin}>Login</button>
                <p>
                    Don't have an account? <Link to="/signup">Sign up</Link>
                </p>
            </div>
            
        </div>
    );
};

export default Login;
