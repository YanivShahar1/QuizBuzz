import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import SessionService from '../../services/SessionService';
import { formatDate } from '../../utils/dateUtils';
import CreateSessionButton from '../../components/Session/Buttons/CreateSessionButton';
import { Accordion, Button, Container, Row, Col } from 'react-bootstrap';
import './SessionStatisticsSection.css';

const SessionStatisticsSection = ({ userName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        const fetchUserSessions = async () => {
            try {
                setIsLoading(true);
                console.log(`Fetching sessions for ${userName}...`);
                const userSessions = await SessionService.fetchUserSessions(userName);
                setSessions(userSessions);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            }
        };

        fetchUserSessions();
    }, [userName]);

    const isSessionStarted = (session) => new Date(session.startedAt) < new Date();
    const isSessionFinished = (session) => new Date(session.endedAt) < new Date();

    const finishedSessions = sessions.filter(session => isSessionFinished(session));
    const notStartedSessions = sessions.filter(session => !isSessionStarted(session));
    const runningSessions = sessions.filter(session => !isSessionFinished(session) && isSessionStarted(session));

    const handleDeleteSession = async (sessionId) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this session?");
            if (!confirmDelete) return;

            await SessionService.deleteSession(sessionId);
            setSessions(prevSessions => prevSessions.filter(session => session.sessionID !== sessionId));
            alert("Session deleted successfully.");
        } catch (error) {
            console.error('Error deleting session:', error);
            alert("An error occurred while deleting the session. Please try again later.");
        }
    };

    const handleDuplicateSession = async (sessionId) => {
        try {
            // Logic to duplicate session
            // You can implement this according to your requirements
        } catch (error) {
            console.error('Error duplicating session:', error);
            alert("An error occurred while duplicating the session. Please try again later.");
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <Row>
            <CreateSessionButton />
            <div className="table-responsive">
                {finishedSessions.length > 0 ? (
                    <div className="table-responsive">
                        <h5>Finished Sessions:</h5>
                        <table className="table table-striped">
                            <thead>
                                <tr>
                                    <th scope="col">#</th>
                                    <th scope="col" className="col-2">Name</th>
                                    <th scope="col" className="col-2">Date Created</th>
                                    <th scope="col" className="col-2">Date Started</th>
                                    <th scope="col" className="col-2">Date Ended</th>
                                    <th scope="col" className="col-2">Number of Participants</th>
                                    <th scope="col" className="col-2">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {finishedSessions.map((session, index) => (
                                    <tr key={session.sessionID}>
                                        <th scope="row" className="col-1">{index + 1}</th>
                                        <td className="col-1">{session.name}</td>
                                        <td className="col-1">{formatDate(session.createdAt)}</td>
                                        <td className="col-1">{formatDate(session.startedAt)}</td>
                                        <td className="col-1">{formatDate(session.endedAt)}</td>
                                        <td className="col-1">{session.participants.length}</td>
                                        <td className="col-1">
                                            <Button variant="danger" onClick={() => handleDeleteSession(session.sessionID)}>
                                                <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                            </Button>
                                            <Button variant="success" className="ml-2">
                                                <FontAwesomeIcon icon={faEye} title="View Statistics" />
                                            </Button>
                                            <Button variant="secondary" className="ml-2" onClick={() => handleDuplicateSession(session.sessionID)}>
                                                Duplicate
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <p>No finished sessions available.</p>
                )}
            </div>
            <div className="session-table-section">
                <h5>Not Started Sessions:</h5>
                {/* Not Started Sessions Table Content */}
            </div>
            <div className="session-table-section">
                <h5>Running Sessions:</h5>
                {/* Running Sessions Table Content */}
            </div>
        </Row>
    );
};

export default SessionStatisticsSection;
