import React, { useState } from 'react';
import { Button, Col, Row, Form } from 'react-bootstrap';

const WaitingRoom = ({ joinChatRoom }) => {
    const [userName, setUserName] = useState('');
    const [chatRoom, setChatRoom] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        joinChatRoom(userName, chatRoom);
    };

    return (
        <Form onSubmit={handleSubmit}>
            <Row className="px-5 py-5">
                <Col>
                    <Form.Group>
                        <Form.Control
                            placeholder="Username"
                            value={userName}
                            onChange={(e) => setUserName(e.target.value)}
                        />

                        <Form.Control
                            placeholder="Chat Room"
                            value={chatRoom}
                            onChange={(e) => setChatRoom(e.target.value)}
                        />
                    </Form.Group>
                </Col>
                <Col sm={12}>
                    <hr />
                    <Button variant="success" type="submit">
                        Join
                    </Button>
                </Col>
            </Row>
        </Form>
    );
};

export default WaitingRoom;
