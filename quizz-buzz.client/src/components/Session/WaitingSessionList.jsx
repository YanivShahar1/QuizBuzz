import React, { useEffect, useState } from 'react';
import { Table, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import SessionService from '../../services/SessionService'; // Assuming you have a service layer to fetch sessions
import CreateSessionButton from './Buttons/CreateSessionButton';
import AuthService from '../../services/AuthService';
import { formatDate ,compareDatesDescending} from '../../utils/dateUtils';
import {
    useSessionStartedListener,
    useUserJoinedListener,
    useSessionHub,
    useSessionUpdatedListener
} from '../../hooks/signalR';

const WaitingSessionsList = () => {
    
    const navigate = useNavigate();
    const connection = useSessionHub();

    const [sessions, setSessions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadSessions = async () => {
            try {
                const filters = {sessionStatus: 'Waiting', startDate: "ss", endDate: "ddfff"}
                const notStartedSessions = await SessionService.fetchByDateAndStatus(filters);
                setSessions(notStartedSessions);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        loadSessions();
    }, []);

    

    
    const handleSessionStarted = async (sessionID) => {
        try {
            console.log(`session ${sessionID} has started`);
            // Remove the session from the state
            setSessions((prevSessions) =>
                prevSessions.filter((session) => session.sessionID !== sessionID)
        );
            
            
        } catch (error) {
            console.error('Error in handle session started:', error);
        }
    };

    const handleUserJoined = async (sessionID, username) => {
        try{
            console.log(`user ${username} joined session ${sessionID}`);
        }catch(error){
            console.error('Error in handle user joined', error);
        }

    }

    const handleSessionUpdated = async (sessionID) => {
        try{
            console.log(`session ${sessionID} has been updated`);
            const updatedSession = SessionService.fetchSession(sessionID);
            // Update the state with the new session details
            setSessions((prevSessions) =>
                prevSessions.map((session) =>
                    session.sessionID === sessionID
                        ? { ...session, ...updatedSession }
                        : session
                )
            );
           
        }catch(error){
            console.error('Error in handle session updated', error);
        }
    }

    useSessionStartedListener(connection, handleSessionStarted);
    useUserJoinedListener(connection,handleUserJoined)

    const handleSessionClick = (sessionId) => {
        navigate(`/session/${sessionId}`);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }


    return (
        <div className="sessions-list-container">
            <CreateSessionButton/>
            <h2 className="mb-4">Available Sessions</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Description</th>
                        <th>Admin</th>
                        <th>Participants</th>
                        <th>Date Created</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {sessions.map((session, i) => (
                        <tr key={i}>
                            <td>{session.name}</td>
                            <td>{session.description}</td>
                            <td>{session.hostUserID}</td>
                            <td>{session.participants.length} </td>
                            <td>{formatDate(session.createdAt)} </td>
                            <td>{AuthService.isAuthenticated() ? (
                                <Button
                                    variant="primary"
                                    onClick={() => handleSessionClick(session.sessionID)}
                                >
                                    View Session
                                </Button>
                            ):(
                                <div>
                                    <p className="text-muted">
                                        <Link to="/login"> Login</Link> or <Link to="/signup">Signup</Link> to join 
                                    </p>
                                </div>
                            )}
                               
                            </td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </div>
    );
};

export default WaitingSessionsList;
