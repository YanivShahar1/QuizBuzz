import React, { useState, useEffect } from 'react';
import SessionService from '../../services/SessionService';
import './WaitingRoom.css';
import AuthService from '../../services/AuthService';
import useUserJoinedListener from '../../hooks/signalR/useUserJoinedListener';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const WaitingRoom = ({ sessionId, isHost , onStartSession, sessionHubConnection, onJoinSession,nickname,setNickname }) => {
    const [participants, setParticipants] = useState([]);
    const [isUserJoined, setIsUserJoined] = useState(false);
    
    useEffect(() => {

        console.log("nickname:", nickname);
      }, [nickname]);

    const handleUserJoinedSession = (nickname) => {
        console.log(`user ${nickname} has joined`);
        fetchSessionParticipants();
    };

    useUserJoinedListener(sessionHubConnection, handleUserJoinedSession);


    useEffect(()=> {
        console.log(`participants list change: ${participants}`);

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
        window.sessionStorage.setItem("nickname", JSON.stringify(nickname));

        setIsUserJoined(true);
        onJoinSession(nickname);
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
                                <p>Welcome, {AuthService.getSessionUsername()}</p>
                                <Button variant="primary" disabled={participants.length<=0} onClick={handleStartSession}>Start Session</Button>

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
                        <h4>User Waiting Room</h4>
                        {isUserJoined ? (
                            <p>Welcome, {nickname}</p>
                        ) : (
                            <Form>
                                <Form.Group controlId="nickname">
                                    <Form.Label>Enter Nickname:</Form.Label>
                                    <Form.Control type="text" placeholder="Enter nickname" value={nickname || ''} onChange={(e) => setNickname(e.target.value)} />
                                </Form.Group>
                                <Button variant="primary" onClick={handleJoinSession}>Join Session</Button>
                            </Form>
                        )}
                    </div>
                )}
                <div className='participants-list'>
                    <h4>Participants:</h4>
                    <ul>
                        {participants.map((nickname, index) => (
                            <li key={index}>{nickname}</li>
                        ))}
                    </ul>
                </div>
            </div>
        </Container>
    );
};

export default WaitingRoom;
