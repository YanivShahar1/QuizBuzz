// Import necessary dependencies and components
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye } from '@fortawesome/free-solid-svg-icons';
import SessionService from '../../services/SessionService';
import { formatDate ,compareDatesDescending} from '../../utils/dateUtils';
import CreateSessionButton from '../../components/Session/Buttons/CreateSessionButton';
import { Button, Row, Modal, Col } from 'react-bootstrap'; // Import Button, Row, and Modal from React-Bootstrap
import SessionAdminStatistics from '../../components/Session/SessionAdminStatistics';
import './UserSessions.css';
import SessionResults from '../../components/Session/SessionResults/SessionResults';

const UserSessions = ({ userName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [showResultsModal, setShowResultsModal] = useState(false);
    const [chosenSessionResults, setChosenSessionResults] = useState(null);


    const sortUserSessions = (sessions) => {
        sessions.sort((a, b) => compareDatesDescending(a.createdAt, b.createdAt));
    };


    useEffect(() => {
        const fetchUserSessions = async () => {
            try {
                setIsLoading(true);
                console.log(`Fetching sessions for ${userName}...`);
                const userSessions = await SessionService.fetchUserSessions(userName);
                sortUserSessions(userSessions);
                setSessions(userSessions);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching sessions:', error);
            }
        };

        fetchUserSessions();
    }, [userName]);

    useEffect(() => {
        // Reset chosenSessionResults to null when showStatisticsModal becomes false
        if(!showResultsModal){
            setChosenSessionResults(null);
        }

    },[showResultsModal])

    const fetchSessionResults = async (sessionId) => {
        try {
            console.log("fetchleaderboardata:")
            const data = await SessionService.fetchSessionResults(sessionId); 
            console.log("sessionresults fetched:", data );
            setChosenSessionResults(data); // Update leaderboard data state
        } catch (error) {
            console.error('Error fetching leaderboard data:', error);
        }
    };

    const finishedSessions = sessions.filter(session => SessionService.isSessionFinished(session));
    const notStartedSessions = sessions.filter(session => !SessionService.isSessionStarted(session));
    const runningSessions = sessions.filter(session => !SessionService.isSessionFinished(session) && SessionService.isSessionStarted(session));

    const handleDeleteSession = async (sessionId) => {
        try {
            const confirmDelete = window.confirm(`Are you sure you want to delete session ${sessionId}?`);
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

     // Function to handle click on "View Statistics" button
     const handleViewResults = (sessionId) => {
        setShowResultsModal(false);
        console.log("in handleViewStatistics");
        fetchSessionResults(sessionId);
        setShowResultsModal(true); // Show the statistics modal
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <Row>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <CreateSessionButton />
            </div>

            {/* Finished Sessions Section */}
            <div className="session-table-section">
                {finishedSessions.length > 0 && (
                    <div>
                        <h5>Finished Sessions:</h5>
                        <table className="table table-striped">
                            {/* Table Header */}
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">ID</th>
                                    <th scope="col">Date Created</th>
                                    <th scope="col">Date Started</th>
                                    <th scope="col">Date Ended</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {finishedSessions.map((session, index) => (
                                    <tr key={session.sessionID}>
                                        <th scope="row">{session.name}</th>
                                        <td>{session.sessionID}</td>
                                        <td>{formatDate(session.createdAt)}</td>
                                        <td>{formatDate(session.startedAt)}</td>
                                        <td>{formatDate(session.endedAt)}</td>
                                        <td>
                                            {/* Buttons for Action */}
                                            <Button variant="danger" onClick={() => handleDeleteSession(session.sessionID)}>
                                                <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                            </Button>
                                            <Button variant="success" className="ml-2" onClick={ () => handleViewResults(session.sessionID)}>
                                                <FontAwesomeIcon icon={faEye} title="View Results" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Not Started Sessions Section */}
            <div className="session-table-section">
                {notStartedSessions.length > 0 && (
                    <div>
                        <h5>Awaiting Sessions:</h5>
                        <table className="table table-striped">
                            {/* Table Header */}
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">ID</th>
                                    <th scope="col">Date Created</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {notStartedSessions.map((session, index) => (
                                    <tr key={session.sessionID}>
                                        <th scope="row">{session.name}</th>
                                        <td>{session.sessionID}</td>
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
                    </div>   
                )}
            </div>

            {/* Running Sessions Section */}
            <div className="session-table-section">
                {runningSessions.length > 0 && (
                    <div>
                        <h5>Running Sessions:</h5>
                        <table className="table table-striped">
                            {/* Table Header */}
                            <thead>
                                <tr>
                                    <th scope="col">Name</th>
                                    <th scope="col">ID</th>
                                    <th scope="col">Date Created</th>
                                    <th scope="col">Date Started</th>
                                    <th scope="col">Actions</th>
                                </tr>
                            </thead>
                            {/* Table Body */}
                            <tbody>
                                {runningSessions.map((session, index) => (
                                    <tr key={session.sessionID}>
                                        <th scope="row">{session.name}</th>
                                        <td>{session.sessionID}</td>
                                        <td>{formatDate(session.createdAt)}</td>
                                        <td>{formatDate(session.startedAt)}</td>
                                        <td>
                                            {/* Buttons for Action */}
                                            <Button variant="danger" onClick={() => handleDeleteSession(session.sessionID)}>
                                                <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                            </Button>
                                            <Button variant="success" className="ml-2" onClick={() => handleViewResults(session.sessionID)}>
                                                <FontAwesomeIcon icon={faEye} title="View Statistics" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal for displaying statistics */}
            <Modal show={showResultsModal && chosenSessionResults != null} onHide={() => setShowResultsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Session Admin Statistics</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <SessionResults data = {chosenSessionResults} />
                </Modal.Body>
            </Modal>
        </Row>
    );
};

export default UserSessions;
