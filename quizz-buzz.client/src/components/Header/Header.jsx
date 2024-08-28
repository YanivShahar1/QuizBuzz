import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Header.css';
import AuthService from '../../services/AuthService';

function Header() {
    const [username, setUsername] = useState(AuthService.getCurrentLogedInUsername());

    useEffect(() => {
        console.log(`Header: user name changed to : ${username}`)

    }, [username])

    useEffect(() => {
        const loginStatusChangeListener = () => {
            const loggedInUsername = AuthService.getCurrentLogedInUsername();
            if(loggedInUsername != null){
                setUsername(loggedInUsername);
            }
        };

        loginStatusChangeListener(); // Initial check

        AuthService.subscribeToLoginStatusChange(loginStatusChangeListener);

        return () => {
            AuthService.unsubscribeFromLoginStatusChange(loginStatusChangeListener);
        };
    }, []);

    const handleLogout = () => {
        AuthService.logout();
        setUsername(null);
    };

    return (
        <header>
            <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
                <div className="container">
                    <Link className="navbar-brand" to="/">Home</Link>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse" id="navbarNav">
                        <ul className="navbar-nav me-auto">
                            <li className="nav-item">
                                <Link className="nav-link" to="/dashboard">Dashboard</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/sessions">Sessions</Link>
                            </li>
                            <li className="nav-item">
                                <Link className="nav-link" to="/settings">Settings</Link>
                            </li>
                        </ul>
                        <div className="navbar-nav">
                            <li className="nav-item">
                                {username ? (
                                    <>
                                        <span className="nav-link">{username}</span>
                                        <Link className="nav-link" to="/logout" onClick={handleLogout}>Logout</Link>
                                    </>
                                ) : (
                                    <>
                                        <Link className="nav-link d-inline-block" to="/login">Log in</Link>
                                        <span className="nav-link d-inline-block"> / </span>
                                        <Link className="nav-link d-inline-block" to="/signup">Sign Up</Link>
                                    </>
                                )}
                            </li>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
}

export default Header;
