import React, { useState, useEffect } from 'react';
import { Form, Button, Row, Col, Alert } from 'react-bootstrap';
import AuthService from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/PasswordInput/PasswordInput';
import 'bootstrap/dist/css/bootstrap.min.css';
import './SignupPage.css';

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

    const [isUsernameValid, setIsUsernameValid] = useState(false);
    const [isEmailValid, setIsEmailValid] = useState(false);
    const [isPasswordValid, setIsPasswordValid] = useState(false);
    const [isFormValid, setIsFormValid] = useState(false);

    const validateUsername = (username) => {
        return username.length > 0; // Add more conditions if needed
    };

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handlePasswordChange = (newPassword) => {
        setPassword(newPassword);

        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasDigit = /\d/.test(newPassword);

        setPasswordConditions({
            hasUpperCase,
            hasLowerCase,
            hasDigit,
        });

        setIsPasswordValid(hasUpperCase && hasLowerCase && hasDigit);
    };

    const handleSignup = async () => {
        try {
            await AuthService.signup(username, email, password);
            setErrorMessage('');
            setShowVerificationUI(true);
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

    useEffect(() => {
        setIsUsernameValid(validateUsername(username));
    }, [username]);

    useEffect(() => {
        setIsEmailValid(validateEmail(email));
    }, [email]);

    useEffect(() => {
        setIsFormValid(isUsernameValid && isEmailValid && isPasswordValid);
    }, [isUsernameValid, isEmailValid, isPasswordValid]);

    return (
        <div className="signup-container">
            <h2 className="mb-4">Signup</h2>
            {showVerificationUI ? (
                <Form>
                    <Form.Group as={Row} controlId="formVerificationCode">
                        <Form.Label column sm={3} className="text-sm-end">Verification Code</Form.Label>
                        <Col sm={9}>
                            <Form.Control 
                                type="text" 
                                value={verificationCode} 
                                onChange={(e) => setVerificationCode(e.target.value)} 
                            />
                        </Col>
                    </Form.Group>
                    <Button onClick={handleVerification} className="mt-4">Verify</Button>
                </Form>
            ) : (
                <Form>
                    <Form.Group as={Row} controlId="formUsername" className="mb-3">
                        <Form.Label column sm={3} className="text-sm-end">Username</Form.Label>
                        <Col sm={9}>
                            <Form.Control 
                                type="text" 
                                value={username} 
                                onChange={(e) => setUsername(e.target.value)} 
                                isInvalid={!isUsernameValid && username.length > 0} 
                            />
                            <Form.Control.Feedback type="invalid">
                                Username is required.
                            </Form.Control.Feedback>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formEmail" className="mb-3">
                        <Form.Label column sm={3} className="text-sm-end">Email</Form.Label>
                        <Col sm={9}>
                            <Form.Control 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                isInvalid={!isEmailValid && email.length > 0} 
                            />
                            <Form.Control.Feedback type="invalid">
                                Email is invalid.
                            </Form.Control.Feedback>
                        </Col>
                    </Form.Group>

                    <Form.Group as={Row} controlId="formPassword" className="mb-3">
                        <Form.Label column sm={3} className="text-sm-end">Password</Form.Label>
                        <Col sm={9}>
                            <PasswordInput
                                value={password}
                                onChange={handlePasswordChange}
                            />
                            <div>
                                {password.length > 0 && (
                                    <>
                                        <Alert variant={passwordConditions.hasUpperCase ? 'success' : 'danger'}>
                                            Password {passwordConditions.hasUpperCase ? 'contains' : 'should contain'} at least one uppercase character.
                                        </Alert>
                                        <Alert variant={passwordConditions.hasLowerCase ? 'success' : 'danger'}>
                                            Password {passwordConditions.hasLowerCase ? 'contains' : 'should contain'} at least one lowercase character.
                                        </Alert>
                                        <Alert variant={passwordConditions.hasDigit ? 'success' : 'danger'}>
                                            Password {passwordConditions.hasDigit ? 'contains' : 'should contain'} at least one digit.
                                        </Alert>
                                    </>
                                )}
                            </div>
                        </Col>
                    </Form.Group>

                    <div className="text-center">
                        <Button onClick={handleSignup()} disabled={!isFormValid} className="mt-4">Signup</Button>
                    </div>
                </Form>
            )}

        </div>
    );
};

export default SignupPage;
