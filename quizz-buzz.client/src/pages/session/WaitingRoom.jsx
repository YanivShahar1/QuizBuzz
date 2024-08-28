import React, { useState, useEffect } from 'react';
import SessionService from '../../services/SessionService';
import './WaitingRoom.css';
import AuthService from '../../services/AuthService';
import useUserJoinedListener from '../../hooks/signalR/useUserJoinedListener';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const WaitingRoom = ({ sessionId, isHost , onStartSession, sessionHubConnection, onJoinSession }) => {
    const [participants, setParticipants] = useState([]);
    const [isUserJoined, setIsUserJoined] = useState(false);
    const username = AuthService.getCurrentLogedInUsername();
    
    const handleUserJoinedSession = (username) => {
        console.log(`user ${username} has joined`);
        fetchSessionParticipants();
    };

    useUserJoinedListener(sessionHubConnection, handleUserJoinedSession);


    useEffect(()=> {
        console.log(`participants list change: ${participants}`);
        if (participants.length > 0 && participants.includes(username)){
            setIsUserJoined(true);
        }

    },[participants])

    useEffect(() => {
        fetchSessionParticipants();
    }, [sessionId]);

    const fetchSessionParticipants = async () => {
        try {
            const sessionParticipants = await SessionService.getParticipants(sessionId);
            setParticipants(sessionParticipants);
        } catch (error) {
            console.error('Error fetching session participants:', error);
        }
    };

    const handleStartSession = async () => {
        try {
            onStartSession();
        } catch (error) {
            console.error('Error starting session:', error);
        }
    };

    useEffect(() => {
        console.log("Participants list changed:", participants);
    }, [participants]);

    const handleJoinSession = async () => {
        const username = AuthService.getCurrentLogedInUsername();
        window.sessionStorage.setItem("username", JSON.stringify());

        setIsUserJoined(true);
        onJoinSession(username);
    };

    const handleCopySessionLink = () => {
        const sessionLink = window.location.href.split('?')[0] + `?sessionId=${sessionId}`;
    
        if (isSecureEnvironment() && navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(sessionLink)
                .then(() => {
                    console.log(`Session link copied to clipboard: ${sessionLink}`);
                })
                .catch((error) => {
                    console.error('Error copying session link:', error);
                    fallbackCopyTextToClipboard(sessionLink);
                });
        } else {
            fallbackCopyTextToClipboard(sessionLink);
        }
    };
    
    const fallbackCopyTextToClipboard = (text) => {
        const tempInput = document.createElement("textarea");
        tempInput.value = text;
        tempInput.setAttribute("readonly", "");
        tempInput.style.position = "absolute";
        tempInput.style.left = "-9999px";
        document.body.appendChild(tempInput);
        
        // Select text
        tempInput.focus();
        tempInput.setSelectionRange(0, tempInput.value.length);
        
        // Copy text
        try {
            document.execCommand("copy");
            console.log(`Session link copied to clipboard (fallback): ${text}`);
        } catch (err) {
            console.error('Fallback copy failed:', err);
        }
        
        document.body.removeChild(tempInput);
    };
    
    const isSecureEnvironment = () => {
        return window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    };
    
    

    return (
        <Container className='waiting-room'>
            <h2>Waiting Room</h2>
            <div className='session-info'>
                {isHost ? (
                    <Row>
                        <Col md={6}>
                            <div className='admin-section'>
                                <h4>Admin Waiting Room</h4>
                                <p>Welcome, {AuthService.getCurrentLogedInUsername()}</p>
                                {participants.length > 0 ? (
                                    <>
                                        <Button variant="primary" onClick={handleStartSession}>Start Session</Button>
                                        <p>You can't participate in this session, since you are the admin and you know the answers :(</p>
                                    </>
                                ):(
                                    <p>You need at least 1 participant to start the session </p>
                                )}
                            </div>
                        </Col>
                        <Col md={6}>
                            <Form.Group controlId="sessionId">
                                <Form.Label>Session ID:</Form.Label>
                                <Form.Control type="text" value={sessionId} readOnly />
                            </Form.Group>
                            <Button variant="secondary" onClick={handleCopySessionLink}>Copy Session Link</Button>
                        </Col>
                    </Row>
                ) : (
                    <div className='user-section'>
                        <h4>Hello, {username}</h4>
                        {isUserJoined ? (
                            <p>Please wait untill the admin will start the session</p>
                        ) : (
                            <Button variant="primary" onClick={handleJoinSession}>Join Session</Button>
                        )}
                    </div>
                )}
                <div className='participants-list'>
                    <h4>Participants:</h4>
                    <ul>
                        {participants.map((username, index) => (
                            <li key={index}>{username}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Container>
    );
};

export default WaitingRoom;
