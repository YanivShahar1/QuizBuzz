import React from 'react';
import { Accordion, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import Select from 'react-select';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const QuestionsSection = ({ questions, setQuestions }) => {
    console.log("in questionsSection 1");
    const toggleMultipleAnswers = (questionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].multipleAnswers = !updatedQuestions[questionIndex].multipleAnswers;
        setQuestions(updatedQuestions);
    };

    const toggleCorrectAnswer = (questionIndex, optionIndex) => {
        const updatedQuestions = [...questions];

        // If multiple answers are allowed, toggle the current option
        if (updatedQuestions[questionIndex].multipleAnswers) {
            const isCorrect = updatedQuestions[questionIndex].correctAnswers.includes(optionIndex);

            if (isCorrect) {
                // Remove from correct answers
                updatedQuestions[questionIndex].correctAnswers = updatedQuestions[questionIndex].correctAnswers.filter(index => index !== optionIndex);
            } else {
                // Add to correct answers
                updatedQuestions[questionIndex].correctAnswers.push(optionIndex);
            }
        } else {
            // For single answer, set only the current option as correct
            updatedQuestions[questionIndex].correctAnswers = [optionIndex];
        }

        setQuestions(updatedQuestions);
    };

    const addQuestion = () => {
        setQuestions([...questions, { question: '', multipleAnswers: false, options: ['', ''], correctAnswers: [] }]);
        /*setCollapsedQuestions([...collapsedQuestions, false]);*/
    };

    const removeQuestion = (index) => {
        const updatedQuestions = [...questions];
        updatedQuestions.splice(index, 1);
        setQuestions(updatedQuestions);
    };

    const addOption = (questionIndex) => {
        if (questions[questionIndex].options.length < 6) {
            const updatedQuestions = [...questions];
            updatedQuestions[questionIndex].options.push('');
            setQuestions(updatedQuestions);
        } else {
            alert('Maximum of 6 options allowed.');
        }
    };

    const removeOption = (questionIndex, optionIndex) => {
        if (questions[questionIndex].options.length > 2) {
            const updatedQuestions = [...questions];
            updatedQuestions[questionIndex].options.splice(optionIndex, 1);
            setQuestions(updatedQuestions);
        } else {
            alert('Minimum of 2 options required.');
        }
    };


    //handlers

    const handleQuestionChange = (questionIndex, field, value) => {
        setQuestions(prevQuestions => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[questionIndex][field] = value;
            return updatedQuestions;
        });
    };


    const handleOptionChange = (questionIndex, optionIndex, value) => {
        setQuestions(prevQuestions => {
            const updatedQuestions = [...prevQuestions];
            updatedQuestions[questionIndex].options[optionIndex] = value;
            return updatedQuestions;
        });
    };
    console.log("in questionsSection 2");

    return (
        <div>
            <Button variant="primary" onClick={addQuestion}>
                Add Question
            </Button>

            {questions.map((question, questionIndex) => (
                <div key={questionIndex} className="question-container">
                    <Form.Group controlId={`formQuestion${questionIndex}`}>
                        <Form.Label>Question:</Form.Label>
                        <Form.Check
                            type="checkbox"
                            label="Allow Multiple Answers"
                            checked={question.multipleAnswers}
                            onChange={() => toggleMultipleAnswers(questionIndex)}
                        />
                        <div className="d-flex align-items-center">
                            <Form.Control
                                type="text"
                                placeholder={`Enter question ${questionIndex + 1}`}
                                value={question.question}
                                onChange={(e) => handleQuestionChange(questionIndex, 'question', e.target.value)}
                            />
                        </div>
                    </Form.Group>

                    <Button variant="success" onClick={() => addOption(questionIndex)}>
                        Add Option
                    </Button>

                    {question.options.map((option, optionIndex) => (
                        <div key={optionIndex} className={`option-container ${question.correctAnswers.includes(optionIndex) ? 'correct-answer' : ''}`}>
                            <Form.Group controlId={`formOption${questionIndex}-${optionIndex}`} className="option-group">
                                <Form.Check
                                    type={question.multipleAnswers ? 'checkbox' : 'radio'}
                                    label={`Option ${optionIndex + 1}`}
                                    checked={question.correctAnswers.includes(optionIndex)}
                                    onChange={() => toggleCorrectAnswer(questionIndex, optionIndex)}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder={`Enter option ${optionIndex + 1}`}
                                    value={option}
                                    onChange={(e) => handleOptionChange(questionIndex, optionIndex, e.target.value)}
                                />
                            </Form.Group>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => removeOption(questionIndex, optionIndex)}
                                disabled={question.options.length <= 2}
                            >
                                <FontAwesomeIcon icon={faTrash} />
                            </Button>
                        </div>
                    ))}

                    <Badge bg="danger" onClick={() => removeQuestion(questionIndex)}>
                        Remove Question
                    </Badge>
                </div>
            ))}

            
        </div>

    )
}

export default QuestionsSection;



