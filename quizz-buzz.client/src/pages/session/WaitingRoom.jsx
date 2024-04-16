import React, { useState, useEffect } from 'react';
import SessionService from '../../services/SessionService';
import './WaitingRoom.css';
import AuthService from '../../services/AuthService';
import useUserJoinedListener from '../../signalR/useUserJoinedListener';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';

const WaitingRoom = ({ session, onStartSession, sessionHubConnection, onJoinSession }) => {
    const [participants, setParticipants] = useState([]);
    const [nickname, setNickname] = useState('');
    const [isUserJoined, setIsUserJoined] = useState(false);


    const isHost = (session) => session.hostUserID === AuthService.getSessionUsername();

    const handleUserJoinedSession = (userId) => {
        fetchSessionParticipants();
    };

    useUserJoinedListener(sessionHubConnection, handleUserJoinedSession);


    useEffect(()=> {
        console.log(`participants list change: ${participants}`);

    },[participants])

    useEffect(() => {
        fetchSessionParticipants();
        if (sessionHubConnection) {
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

    const handleCopySessionLink = () => {
        const sessionLink = window.location.href.split('?')[0] + `?sessionId=${session.sessionID}`;
        navigator.clipboard.writeText(sessionLink)
            .then(() => {
                console.log(`Session link copied to clipboard: ${sessionLink}`);
            })
            .catch((error) => {
                console.error('Error copying session link:', error);
            });
    };
    

    return (
        <Container className='waiting-room'>
            <h2>Waiting Room</h2>
            <div className='session-info'>
                {isHost(session) ? (
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
                                <Form.Control type="text" value={session.sessionID} readOnly />
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
                                    <Form.Control type="text" placeholder="Enter nickname" value={nickname} onChange={(e) => setNickname(e.target.value)} />
                                </Form.Group>
                                <Button variant="primary" onClick={handleJoinSession}>Join Session</Button>
                            </Form>
                        )}
                    </div>
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
        </Container>
    );
};

export default WaitingRoom;
