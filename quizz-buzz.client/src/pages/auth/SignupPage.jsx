//TODO : check condition for existing username / email/ uppercase lowercase etc

import React, { useState } from 'react';
import AuthService from '../../services/AuthService';
import './SignupPage.css'; 
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/PasswordInput/PasswordInput';

const SignupPage = () => {
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [verificationCode, setVerificationCode] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [showVerificationUI, setShowVerificationUI] = useState(false);


    const [passwordConditions, setPasswordConditions] = useState({
        hasUpperCase: false,
        hasLowerCase: false,
        hasDigit: false,
    });

    const handlePasswordChange = (newPassword) => {

        setPassword(newPassword);

        // Check password conditions
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasDigit = /\d/.test(newPassword);

        setPasswordConditions({
            hasUpperCase,
            hasLowerCase,
            hasDigit,
        });
    };

    const handleSignup = async () => {
        try {

            console.log(`signup-> username => ${username} password => ${password} email => ${email}`)
            await AuthService.signup(username, email, password);
            setErrorMessage('');
            setShowVerificationUI(true); // Display UI to enter verification code
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    const handleVerification = async () => {
        try {
            await AuthService.verifyEmail(username, verificationCode);
            navigate('/'); 
        } catch (error) {
            setErrorMessage(error.message);
        }
    };

    return (
        <div className="signup-container">
            <h2>Signup</h2>
            {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
            {!showVerificationUI ? (
                <div>
                    <div className="signup-page">
                        <label>
                            Username:
                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                        </label>
                        <br />
                        <label>
                            Email:
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </label>
                        <br />
                        <PasswordInput
                            value={password}
                            onChange={handlePasswordChange} // Add this line
                        />
                        {passwordConditions.hasUpperCase ? (
                            <div style={{ color: 'green' }}>Password contains at least one uppercase character.</div>
                        ) : (
                            <div style={{ color: 'red' }}>Password should contain at least one uppercase character.</div>
                        )}
                        {passwordConditions.hasLowerCase ? (
                            <div style={{ color: 'green' }}>Password contains at least one lowercase character.</div>
                        ) : (
                            <div style={{ color: 'red' }}>Password should contain at least one lowercase character.</div>
                        )}
                        {passwordConditions.hasDigit ? (
                            <div style={{ color: 'green' }}>Password contains at least one digit.</div>
                        ) : (
                            <div style={{ color: 'red' }}>Password should contain at least one digit.</div>
                        )}
                        <br />
                        <button onClick={handleSignup}>Signup</button>
                    </div>
                </div>
            ) : (
                <div>
                    <label>
                        Verification Code:
                        <input type="text" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} />
                    </label>
                    <br />
                    <button onClick={handleVerification}>Verify</button>
                </div>
            )}
        </div>
    );
};

export default SignupPage;
