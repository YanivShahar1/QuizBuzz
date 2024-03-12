import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionService from '../../services/SessionService';
import './WaitingRoom.css';
import AuthService from '../../services/AuthService';
import useUserJoinedListener from '../../signalR/useUserJoinedListener';
import useSessionStartedListener from '../../signalR/useSessionStartedListener';

const WaitingRoom = ({session, onStartSession, sessionHubConnection, onNicknameSubmit}) => {
    console.log(`session ID : ${session.sessionID}`);
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [nickname, setNickname] = useState('');

    const isHost = (session) => session.hostUserID === AuthService.getSessionUsername();


    // Define event handler for "UserJoined" event for the specific session ID
    const handleUserJoinedSession = (userId) => {
        console.log(`Received UserJoined message for user ${userId} in session ${session.sessionID}`);
        fetchSessionParticipants(); // Assuming you want to fetch participants when a new user joins
    };

    // Define event handler for "SessionStarted" event
    const handleSessionStarted = (startedSessionId) => {
        console.log(`Session ${startedSessionId} has started`);
        if (startedSessionId === session.sessionID) {
            onStartSession();
        }
    };
    useUserJoinedListener(sessionHubConnection, handleUserJoinedSession);
    useSessionStartedListener(sessionHubConnection, handleSessionStarted);
    
    useEffect(() => {
        fetchSessionParticipants();
        console.log(`adding host user of session to user joined listener..`);
        if(sessionHubConnection){
            sessionHubConnection.invoke("UserJoined", session.sessionID, session.hostUserID);
        }
        
    }, [session]);

    const fetchSessionParticipants = async () => {
        try {
            const sessionStudents = await SessionService.getParticipants(session.sessionID);
            setParticipants(sessionStudents);
        } catch (error) {
            console.error('Error fetching session students:', error);
        }
    };

    const handleStartSession = async () => {
        try {
            await sessionHubConnection.invoke("SessionStarted", session.sessionID);
            onStartSession();
        } catch (error) {
            console.error('Error starting session:', error);
        }
    };

    useEffect(() => {
        console.log("Participants list changed:", participants);
    }, [participants]);
    
    
    const handleJoinSession = async () => {
        try {
            console.log(`handleJoinSession: user nickname is ${nickname}, want to join : ${session.sessionID}`)
            await SessionService.joinSession(session.sessionID, nickname);
            console.log("finish joinSession with SessionService ");
            console.log("Notify other participants about the new user with sessionId ");

            // Notify other participants about the new user with sessionId
            sessionHubConnection.invoke("UserJoined", session.sessionID, nickname);
            console.log("finish -> Notify other participants about the new user with sessionId ");
            // Listen for the 'sessionstarted' event
            
            sessionHubConnection.on("SessionStarted", onStartSession);
            console.log("listening to SessionStarted event");

            onNicknameSubmit(nickname);


        }catch(e){
            console.log(e);
        }
    };


    const handleCopySessionId = () => {
        navigator.clipboard.writeText(session.sessionID)
            .then(() => {
                console.log(`session id copied to clipboard!`);
            })
            .catch((error) => {
                console.error('Error copying session ID:', error);
            });
    };

    return (
        <div className='waiting-room'>
            <h2>Waiting Room</h2>
            <div className='session-info'>
                {isHost ? (
                    <>
                        <div className='admin-section'>
                            <h4>Admin Waiting Room</h4>
                            <button onClick={handleStartSession}>Start Session</button>
                        </div>
                        <label className="session-label">
                            Session ID:
                        </label>
                        <span className="session-id">
                            {session.sessionID}{' '}
                            <span
                                role="img"
                                aria-label="copy"
                                title="Copy"
                                className="copy-icon"
                                onClick={handleCopySessionId}
                            >
                                &#x1F4CB;
                            </span>
                        </span>
                    </>
                ) : (
                    <>
                        <div className='user-section'>
                            <h4>User Waiting Room</h4>
                            <input
                                type='text'
                                placeholder='Enter Nickname'
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                            />
                            <button onClick={handleJoinSession}>Join Session</button>
                        </div>
                    </>
                )}
                <div className='students-list'>
                    <h4>Students Joined:</h4>
                    <ul>
                        {participants.map((student, index) => (
                            <li key={index}>{student}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default WaitingRoom;
