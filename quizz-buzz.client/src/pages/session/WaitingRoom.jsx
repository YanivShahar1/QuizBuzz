import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import SessionService from '../../services/SessionService';
import './WaitingRoom.css';
import AuthService from '../../services/AuthService';
import { HubConnectionBuilder, LogLevel,HttpTransportType } from '@microsoft/signalr';

const WaitingRoom = ({session, onStartSession}) => {
    console.log(`session ID : ${session.sessionID}`);
    const[sessionHubConnection, setSessionHubConnection] = useState(null);
    const navigate = useNavigate();
    const [participants, setParticipants] = useState([]);
    const [nickname, setNickname] = useState('');
    const [isHost, setIsHost] = useState(false);

    useEffect(() => {
        // Define event handler for "UserJoined" event for the specific session ID
        const handleUserJoined = (userId) => {
            console.log(`Received UserJoined message for user ${userId} in session ${session.sessionID}`);
            fetchSessionParticipants(); // Assuming you want to fetch participants when a new user joins
        };
    
        // Register event handler for "UserJoined" event for the specific session ID
        if (sessionHubConnection) {
            sessionHubConnection.on("UserJoined", handleUserJoined);
            console.log("now listening to UserJoined");
            //register hostuser to listen the session
            sessionHubConnection.invoke("UserJoined", session.sessionID, nickname);


        }
        
        return () => {
            // Cleanup function to unregister event handler
            if (sessionHubConnection) {
                sessionHubConnection.off("UserJoined", handleUserJoined);
            }
        };
    }, [session, sessionHubConnection]);
    
    useEffect(() => {
        // Create a SignalR connection
        const conn = new HubConnectionBuilder()
            .withUrl("https://localhost:7141/sessionHub")
            .configureLogging(LogLevel.Debug)
            .build();


        // Start the SignalR connection
        conn.start().then(() => {
            console.log("SignalR connection established");
            console.log(`signal r connectionId: ${conn.connectionId}`);
            console.log(`signal r baseUrl: ${conn.baseUrl}`);
            console.log(`signal r conn: ${conn}`);
            setSessionHubConnection(conn);
            conn.invoke("UserJoined", session.sessionID, session.hostUserID);
        }).catch((error) => {
            console.error("Error establishing SignalR connection:", error);
        });

        return () => {
            // Cleanup function to unregister event handler and stop SignalR connection
            console.log("cleanup funtions of session hub");
            conn.stop();
        };
    }, [session]);

    useEffect(() => {
        if (!isHost && sessionHubConnection) {
            // Define event handler for "SessionStarted" event
            sessionHubConnection.on("SessionStarted", (startedSessionId) => {
                console.log(`Session ${startedSessionId} has started`);
                if (startedSessionId === session.sessionID) {
                    onStartSession();
                }
            });
            console.log("now listening to SessionStarted");
        }
    }, [isHost, sessionHubConnection, session.sessionID, navigate]);
    
    const fetchSessionParticipants = async () => {
        try {
            const sessionStudents = await SessionService.getParticipants(session.sessionID);
            setParticipants(sessionStudents);
        } catch (error) {
            console.error('Error fetching session students:', error);
        }
    };

    useEffect(() => {
        fetchSessionParticipants();
        if (session){
            // Check if the current user is the host of the session
            console.log(`want to check host, session id is : ${session.sessionID}`);
            const checkHost = async () => {
                try {
                    setIsHost(session.hostUserID === AuthService.getSessionUsername()); 
                    console.log(`setted is host`);
                } catch (error) {
                    console.error('Error checking host:', error);
                }
            };
            
            checkHost();
        }
        else{
            console.log("no session yet, cant check host");
        }
    }, [session]);

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
