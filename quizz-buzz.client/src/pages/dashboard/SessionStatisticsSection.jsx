import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEye, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import SessionService from '../../services/SessionService';
import { formatDate } from '../../utils/dateUtils';
import CreateSessionButton from '../../components/Session/Buttons/CreateSessionButton';


const SessionStatisticsSection = ({ userName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [sessions, setSessions] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    useEffect(() => {
        // Fetch user sessions
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

    // Function to toggle collapse
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };


    // Check if the session has started
    const isSessionStarted = (session) => new Date(session.startedAt) < new Date();

    // Check if the session has finished
    const isSessionFinished = (session) => new Date(session.endedAt) < new Date();

    // Filter sessions into different categories
    //TODO handle it better way
    const finishedSessions = sessions.filter(session => isSessionFinished(session));
    const notStartedSessions = sessions.filter(session => !isSessionStarted(session));
    const runningSessions = sessions.filter(session => !isSessionFinished(session) && isSessionStarted(session));

    // Function to handle session deletion
    const handleDeleteSession = async (sessionId) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this session?");
            if (!confirmDelete) {
                return;
            }

            await SessionService.deleteSession(sessionId);
            setSessions(prevSessions => prevSessions.filter(session => session.sessionID !== sessionId));
            alert("Session deleted successfully.");
        } catch (error) {
            console.error('Error deleting session:', error);
            alert("An error occurred while deleting the session. Please try again later.");
        }
    };

    // Loading state
    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2 onClick={toggleCollapse}>
                <FontAwesomeIcon icon={isCollapsed ? faAngleDown : faAngleUp} />
                Sessions Statistics
            </h2>
            <div className="d-flex justify-content-between align-items-center mb-3">
                <div></div>
                <CreateSessionButton />
            </div>
            {/* Render tables if not collapsed */}
            {!isCollapsed && (
                <div>
                    {/* Finished Sessions Table */}
                    <div>
                        <h5>Finished Sessions:</h5>
                        {finishedSessions.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    {/* Table Headers */}
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
                                    {/* Table Body */}
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
                                                    <button onClick={() => handleDeleteSession(session.sessionID)} className="btn btn-danger mr-2">
                                                        <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                                    </button>
                                                    <button className="btn btn-success">
                                                        <FontAwesomeIcon icon={faEye} title="View Statistics" />
                                                    </button>
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

                    {/* Not Started Sessions Table */}
                    <div>
                        <h5>Not Started Sessions:</h5>
                        {notStartedSessions.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    {/* Table Headers */}
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col" className="col-2">Name</th>
                                            <th scope="col" className="col-2">Date Created</th>
                            <th scope="col" className="col-2">Actions</th>
                        </tr>
                        </thead>
                        {/* Table Body */}
                        <tbody>
                            {notStartedSessions.map((session, index) => (
                                <tr key={session.sessionID}>
                                    <th scope="row" className="col-1">{index + 1}</th>
                                    <td className="col-1">{session.name}</td>
                                    <td className="col-1">{formatDate(session.createdAt)}</td>
                                    <td className="col-1">
                                        <a href={`session/${session.sessionID}`} className="btn btn-primary">
                                            Enter Session
                                        </a>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>


                    {/* Running Sessions Table */}
                    <div>
                        <h5>Running Sessions:</h5>
                        {runningSessions.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    {/* Table Headers */}
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col" className="col-2">Name</th>
                                            <th scope="col" className="col-2">Date Created</th>
                                            <th scope="col" className="col-2">Date Started</th>
                                            <th scope="col" className="col-2">Number of Participants</th>
                                            <th scope="col" className="col-2">Actions</th>
                                        </tr>
                                    </thead>
                                    {/* Table Body */}
                                    <tbody>
                                        {runningSessions.map((session, index) => (
                                            <tr key={session.sessionID}>
                                                <th scope="row" className="col-1">{index + 1}</th>
                                                <td className="col-1">{session.name}</td>
                                                <td className="col-1">{formatDate(session.createdAt)}</td>
                                                <td className="col-1">{formatDate(session.startedAt)}</td>
                                                <td className="col-1">{session.participants.length}</td>
                                                <td className="col-1">
                                                    <button onClick={() => handleDeleteSession(session.sessionID)} className="btn btn-danger mr-2">
                                                        <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                                    </button>
                                                    <button className="btn btn-success">
                                                        <FontAwesomeIcon icon={faEye} title="View Statistics" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>No running sessions available.</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SessionStatisticsSection;
