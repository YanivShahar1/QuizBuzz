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
        console.log('Sessions:');
        sessions.forEach(session => {
            console.log('Session ID:', session.sessionID);
            console.log('Title:', session.title);
            console.log('Date Created:', formatDate(session.createdAt));
            console.log('Date Ended 1 :', formatDate(session.endedAt));
            console.log('Date Ended 2 :', formatDate(new Date(session.endedAt)));
            console.log('Date Started:', formatDate(session.startedAt));
            console.log('Date min:', formatDate(new Date(0)));
            console.log('Number of Participants:', session.participants.length);
            console.log('-----------------------------');
        });
    }, [sessions]);
    
    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

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

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2 onClick={toggleCollapse}>
                <FontAwesomeIcon icon={isCollapsed ? faAngleDown : faAngleUp} />
                Sessions Statistics
            </h2>

            {!isCollapsed && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <div></div>
                        <CreateSessionButton userName={ userName} />
                    </div>
                    {sessions.length > 0 ? (
                        <>
                            <h5>Here are your sessions:</h5>
                            
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col" className="col-2">Name</th>
                                            <th scope="col" className="col-2">Date Created</th>
                                            {sessions.some(session => session.startedAt !== Date.MinValue) && <th scope="col" className="col-2">Date Started</th>}
                                            {sessions.some(session => session.endedAt !== Date.MinValue) && <th scope="col" className="col-2">Date Ended</th>}  
                                            {sessions.some(session => session.participants.length) && <th scope="col" className="col-2">Number of Participants</th>}
                                            <th scope="col" className="col-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sessions.map((session, index) => (
                                            <tr key={session.sessionID}>
                                                <th scope="row" className="col-1">{index + 1}</th>
                                                <td className="col-1">{session.name}</td>
                                                <td className="col-1">{formatDate(session.createdAt)}</td>
                                                {session.startedAt !== Date.MinValue && <td className="col-1">{formatDate(new Date(session.startedAt))}</td>}
                                                {session.endedAt !== Date.MinValue && <td className="col-1">{formatDate(session.endedAt)}</td>}
                                                {session.participants.length > 0 && <td className="col-1">{session.participants.length}</td>}
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
                        </>
                    ) : (
                        <p>No sessions available.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default SessionStatisticsSection;
