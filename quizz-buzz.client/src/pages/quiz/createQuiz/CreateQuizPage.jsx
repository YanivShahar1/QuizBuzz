import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Accordion, Button } from 'react-bootstrap';
import GeneralInfoEditor from './GeneralInfoEditor';
import QuestionEditor from './QuestionEditor';
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
                console.log(`categories: ${categories}`);
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
            //correct answerd index to corect answer strings
            const newQuiz = {
                hostUserId: AuthService.getSessionUsername(),
                title: quizInfo.title,
                category: quizInfo.category,
                description: quizInfo.description,
                questions: questions.map(questionData => ({
                    questionText: questionData.question,
                    options: questionData.options,
                    correctOptions: questionData.correctAnswers.map(index => questionData.options[index]),
                    isMultipleAnswerAllowed: questionData.multipleAnswers
                })),
            };

            console.log(`want to submit quiz -> ${JSON.stringify(newQuiz)}`);
            const createdQuizID = await QuizService.submitQuiz(newQuiz);
            alert(`Quiz submitted successfully! Quiz ID: ${createdQuizID}`);
            navigate('/dashboard');
        } catch (error) {
            console.error('Error submitting quiz:', error);
            setError('An error occurred while submitting the quiz:', error);
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
                    <Accordion defaultActiveKey="0" alwaysOpen>
                        <Accordion.Item eventKey="0">
                            <Accordion.Header>General Quiz Info</Accordion.Header>
                            <Accordion.Body>
                                <GeneralInfoEditor info={quizInfo} onInfoChange={handleQuizInfoChange} categories={categories} />
                            </Accordion.Body>
                        </Accordion.Item>
                        <Accordion.Item eventKey="1">
                            <Accordion.Header>Quiz Questions</Accordion.Header>
                            <Accordion.Body>
                                <QuestionEditor questions={questions} setQuestions={setQuestions} />
                                
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
