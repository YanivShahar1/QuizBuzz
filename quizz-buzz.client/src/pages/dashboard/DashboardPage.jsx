import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Accordion, Button } from 'react-bootstrap';
import UserQuizzes from './UserQuizzes';
import UserSessions from './UserSessions';
import AuthService from '../../services/AuthService';
import './DashboardPage.css';
import useRequireAuth from '../../hooks/useRequireAuth';

const DashboardPage = () => {
    const isAuthenticated = useRequireAuth();
    const navigate = useNavigate();
    const [username, setUsername] = useState(AuthService.getCurrentLogedInUsername());
    
    useEffect(() => {
        if (!username) {
            // If session user name is null, navigate to login page
            navigate('/login');
        }
    }, [username, navigate]);
    
    return (
        <div className="dashboard-container">
            <h1 className="dashboard-header">Welcome, {username}!</h1>
            <Accordion defaultActiveKey="0" className="accordion-container">
                <Accordion.Item eventKey="0">
                    <Accordion.Header className="section-header">Quizzes</Accordion.Header>
                    <Accordion.Body className="section-container">
                        <UserQuizzes userName={username} />
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item eventKey="1">
                    <Accordion.Header className="section-header">Session Statistics</Accordion.Header>
                    <Accordion.Body className="section-container">
                        <UserSessions userName={username} />
                    </Accordion.Body>
                </Accordion.Item>
            </Accordion>
        </div>
    );
};

export default DashboardPage;
