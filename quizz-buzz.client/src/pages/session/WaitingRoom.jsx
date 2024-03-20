import React, { useState, useEffect } from 'react';
import SessionService from '../../services/SessionService';
import './WaitingRoom.css';
import AuthService from '../../services/AuthService';
import useUserJoinedListener from '../../signalR/useUserJoinedListener';

const WaitingRoom = ({session, onStartSession, sessionHubConnection, onJoinSession}) => {
    console.log(`session ID : ${session.sessionID}`);
    const [participants, setParticipants] = useState([]);
    const [nickname, setNickname] = useState('');
    const [isUserJoined, setIsUserJoined] = useState(false);

    const isHost = (session) => session.hostUserID === AuthService.getSessionUsername();


    // Define event handler for "UserJoined" event for the specific session ID
    const handleUserJoinedSession = (userId) => {
        console.log(`Received UserJoined message for user ${userId} in session ${session.sessionID}`);
        fetchSessionParticipants(); // Assuming you want to fetch participants when a new user joins
    };
   
    useUserJoinedListener(sessionHubConnection, handleUserJoinedSession);
    
    useEffect(() => {
        fetchSessionParticipants();
        console.log(`adding host user of session to user joined listener..`);
        if(sessionHubConnection){
            sessionHubConnection.invoke("UserJoined", session.sessionID, session.hostUserID);
        }
        
    }, [session]);

    const fetchSessionParticipants = async () => {
        try {
            const sessionParticipants = await SessionService.getParticipants(session.sessionID);
            setParticipants(sessionParticipants);
        } catch (error) {
            console.error('Error fetching session students:', error);
        }
    };

    const handleStartSession = async () => {
        try {
            console.log(`clicked on start session going to onstartsession`);
            onStartSession();
        } catch (error) {
            console.error('Error starting session:', error);
        }
    };

    useEffect(() => {
        console.log("Participants list changed:", participants);
    }, [participants]);
    
    
    const handleJoinSession = async () => {
        setIsUserJoined(true);
        onJoinSession(nickname);
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
                {isHost(session) ? (
                    <>
                        <div className='admin-section'>
                            <h4>Admin Waiting Room</h4>
                            <p>Welcome, {AuthService.getSessionUsername()}</p>
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
                            {isUserJoined && (
                                <p>Welcome, {nickname}</p>
                            )}
                            
                            {!isUserJoined && (
                                <div>
                                    <input
                                        type='text'
                                        placeholder='Enter Nickname'
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                    />
                                    <button onClick={handleJoinSession}>Join Session</button>
                                </div>
                            )}

                            
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
