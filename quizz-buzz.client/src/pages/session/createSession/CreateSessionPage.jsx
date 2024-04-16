import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SessionService from '../../../services/SessionService';
import QuizService from '../../../services/QuizService';
import AuthService from '../../../services/AuthService';
import { Form, Button, Row, Col, Alert, Container, Accordion } from 'react-bootstrap';

const CreateSessionPage = () => {
    const [userName, setUserName] = useState(AuthService.getSessionUsername());
    const [loading, setLoading] = useState(false);
    const [sessionInfo, setSessionInfo] = useState({
        hostUserId: AuthService.getSessionUsername(),
        name: '',
        associatedQuizID: '',
        maxTimePerQuestion: '60',
        maxParticipants: '20',
    });
    const [userQuizzes, setUserQuizzes] = useState([]);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserQuizzes = async () => {
            try {
                const quizzes = await QuizService.fetchUserQuizzes(userName);
                setUserQuizzes(quizzes);
            } catch (error) {
                console.error('Error fetching user quizzes:', error);
            }
        };

        fetchUserQuizzes();
    }, [userName]);

    const handleSubmitSession = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (!sessionInfo.name || !sessionInfo.associatedQuizID || !sessionInfo.maxTimePerQuestion || !sessionInfo.maxParticipants) {
                setError('Please fill in all fields.');
                return;
            }

            const sessionId = await SessionService.submitSession(sessionInfo);
            alert(`Session submitted successfully! Session ID: ${sessionId}`);
            navigate(`/session/${sessionId}`);
        } catch (error) {
            setError(`Error submitting new session: ${error.response ? error.response.data : error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const canSubmit = () => {
        return sessionInfo.name && sessionInfo.associatedQuizID && sessionInfo.maxTimePerQuestion && sessionInfo.maxParticipants;
    };

    return (
        <Container>
            <Row className="justify-content-center">
                <Col md={8}>
                    <h2 className="mt-5 mb-4">Create Session</h2>
                    <Form onSubmit={handleSubmitSession}>
                        <Form.Group controlId="sessionName">
                            <Form.Label>Session Name:</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter session name"
                                value={sessionInfo.name}
                                onChange={(e) => setSessionInfo({ ...sessionInfo, name: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="selectQuiz">
                            <Form.Label>Select Quiz:</Form.Label>
                            <Form.Control
                                as="select"
                                value={sessionInfo.associatedQuizID}
                                onChange={(e) => setSessionInfo({ ...sessionInfo, associatedQuizID: e.target.value })}
                                required
                            >
                                <option value="">Select a Quiz</option>
                                {userQuizzes.map((quiz) => (
                                    <option key={quiz.quizID} value={quiz.quizID}>
                                        {quiz.title}
                                    </option>
                                ))}
                            </Form.Control>
                        </Form.Group>
                        <Form.Group controlId="maxTimePerQuestion">
                            <Form.Label>Max Time Per Question (seconds):</Form.Label>
                            <Form.Control
                                type="number"
                                value={sessionInfo.maxTimePerQuestion}
                                onChange={(e) => setSessionInfo({ ...sessionInfo, maxTimePerQuestion: e.target.value })}
                                required
                            />
                        </Form.Group>
                        <Form.Group controlId="maxParticipants">
                            <Form.Label>Max Participants:</Form.Label>
                            <Form.Control
                                type="number"
                                value={sessionInfo.maxParticipants}
                                onChange={(e) => setSessionInfo({ ...sessionInfo, maxParticipants: e.target.value })}
                                required
                            />
                        </Form.Group>
                        {error && <Alert variant="danger">{error}</Alert>}
                        <Button variant="success" type="submit" disabled={!canSubmit()}>
                            {loading ? 'Submitting...' : 'Submit Session'}
                        </Button>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
};

export default CreateSessionPage;
