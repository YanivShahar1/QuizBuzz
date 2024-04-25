// Import necessary dependencies and components
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import SessionService from '../../services/SessionService';
import { formatDate } from '../../utils/dateUtils';
import CreateSessionButton from '../../components/Session/Buttons/CreateSessionButton';
import { Button, Row } from 'react-bootstrap'; // Import Button and Row from React-Bootstrap
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

    const finishedSessions = sessions.filter(session => SessionService.isSessionFinished(session));
    const notStartedSessions = sessions.filter(session => !SessionService.isSessionStarted(session));
    const runningSessions = sessions.filter(session => !SessionService.isSessionFinished(session) && SessionService.isSessionStarted(session));

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

            {/* Finished Sessions Section */}
            <div className="session-table-section">
                <h5>Finished Sessions:</h5>
                {finishedSessions.length > 0 ? (
                    <table className="table table-striped">
                        {/* Table Header */}
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Date Started</th>
                                <th scope="col">Date Ended</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {finishedSessions.map((session, index) => (
                                <tr key={session.sessionID}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{session.name}</td>
                                    <td>{formatDate(session.startedAt)}</td>
                                    <td>{formatDate(session.endedAt)}</td>
                                    <td>
                                        {/* Buttons for Action */}
                                        <Button variant="danger" onClick={() => handleDeleteSession(session.sessionID)}>
                                            <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                        </Button>
                                        <Button variant="success" className="ml-2">
                                            <FontAwesomeIcon icon={faEye} title="View Statistics" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No finished sessions available.</p>
                )}
            </div>

            {/* Not Started Sessions Section */}
            <div className="session-table-section">
                <h5>Not Started Sessions:</h5>
                {notStartedSessions.length > 0 ? (
                    <table className="table table-striped">
                        {/* Table Header */}
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Date Created</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {notStartedSessions.map((session, index) => (
                                <tr key={session.sessionID}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{session.name}</td>
                                    <td>{formatDate(session.createdAt)}</td>
                                    <td>
                                        {/* Buttons for Action */}
                                        <Button variant="danger" onClick={() => handleDeleteSession(session.sessionID)}>
                                            <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                        </Button>
                                        <Button variant="success" className="ml-2">
                                            <FontAwesomeIcon icon={faEye} title="View Statistics" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No not started sessions available.</p>
                )}
            </div>

            {/* Running Sessions Section */}
            <div className="session-table-section">
                <h5>Running Sessions:</h5>
                {runningSessions.length > 0 ? (
                    <table className="table table-striped">
                        {/* Table Header */}
                        <thead>
                            <tr>
                                <th scope="col">#</th>
                                <th scope="col">Name</th>
                                <th scope="col">Date Started</th>
                                <th scope="col">Actions</th>
                            </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {runningSessions.map((session, index) => (
                                <tr key={session.sessionID}>
                                    <th scope="row">{index + 1}</th>
                                    <td>{session.name}</td>
                                    <td>{formatDate(session.startedAt)}</td>
                                    <td>
                                        {/* Buttons for Action */}
                                        <Button variant="danger" onClick={() => handleDeleteSession(session.sessionID)}>
                                            <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                        </Button>
                                        <Button variant="success" className="ml-2">
                                            <FontAwesomeIcon icon={faEye} title="View Statistics" />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No running sessions available.</p>
                )}
            </div>
        </Row>
    );
};

export default SessionStatisticsSection;
