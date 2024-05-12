import React, { useEffect, useState } from 'react';
import { Row, Col, Accordion, Button } from 'react-bootstrap';
import QuizzesSection from './QuizzesSection';
import SessionStatisticsSection from './SessionStatisticsSection';
import AuthService from '../../services/AuthService';
import './DashboardPage.css';
import useRequireAuth from '../../hooks/useRequireAuth';

const DashboardPage = () => {
    const [sessionUserName, setSessionUserName] = useState(AuthService.getSessionUsername());

    if (useRequireAuth()){
        return (
            <div className="dashboard-container">
                <h1 className="dashboard-header">Welcome, {sessionUserName}!</h1>
                <Accordion defaultActiveKey="0" className="accordion-container">
                    <Accordion.Item eventKey="0">
                        <Accordion.Header className="section-header">Quizzes</Accordion.Header>
                        <Accordion.Body className="section-container">
                            <QuizzesSection userName={sessionUserName} />
                        </Accordion.Body>
                    </Accordion.Item>
                    <Accordion.Item eventKey="1">
                        <Accordion.Header className="section-header">Session Statistics</Accordion.Header>
                        <Accordion.Body className="section-container">
                            <SessionStatisticsSection userName={sessionUserName} />
                        </Accordion.Body>
                    </Accordion.Item>
                </Accordion>
            </div>
        );
    }
};

export default DashboardPage;
