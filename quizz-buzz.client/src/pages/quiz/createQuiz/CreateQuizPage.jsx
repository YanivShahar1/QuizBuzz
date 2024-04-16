import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Accordion, Button } from 'react-bootstrap';
import InfoSection from './InfoSection';
import QuestionsSection from './QuestionsSection';
import QuizService from '../../../services/QuizService';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/AuthService';

const CreateQuizPage = () => {
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [questions, setQuestions] = useState([]);
    const [quizInfo, setQuizInfo] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await QuizService.fetchCategories();
                setCategories(categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                setError('An error occurred while fetching categories. Please try again.');
            }
        };

        fetchCategories();
    }, []);

    const handleQuizInfoChange = (newInfo) => {
        setQuizInfo(newInfo);
    };

    const handleQuizSubmission = async () => {
        try {
            setIsSubmitting(true);
            const newQuiz = {
                hostUserId: AuthService.getSessionUsername(),
                title: quizInfo.title,
                category: quizInfo.category,
                description: quizInfo.description,
                questions: questions.map(questionData => ({
                    questionText: questionData.question,
                    options: questionData.options,
                    correctOptions: questionData.correctAnswers,
                    isMultipleAnswerAllowed: questionData.multipleAnswers
                })),
            };

            console.log(`want to submit quiz -> ${newQuiz}`);
            const createdQuizID = await QuizService.submitQuiz(newQuiz);
            alert(`Quiz submitted successfully! Quiz ID: ${createdQuizID}`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError('An error occurred while submitting the quiz. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canSubmit = () => {
        return questions.length > 0 && questions.every(question => question.correctAnswers.length > 0 && question.options.length >= 2);
    };

    console.log(`in CreateQuizPage : 5`);

    return (
        <Container>
            <h1>Create Your Own Quiz</h1>
            <Row>
                <Col>
                    <Accordion alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>General Quiz Info</Accordion.Header>
                            <Accordion.Body>
                                <InfoSection info={quizInfo} onInfoChange={handleQuizInfoChange} categories={categories} />
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Quiz Questions</Accordion.Header>
                            <Accordion.Body>
                                <QuestionsSection questions={questions} setQuestions={setQuestions} />
                                
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                </Col>
            </Row>
            <Row>
                {canSubmit() && (
                    <Button variant="success" className="mt-3" onClick={handleQuizSubmission}>
                        {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
                    </Button>
                )}
                {error && <div className="error-message">{error}</div>}
            </Row>
        </Container>
    );
};

export default CreateQuizPage;
