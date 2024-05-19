import React, { useState, useEffect, useRef } from 'react';
import { Button, Container, Form, Row, Col, FormControl, FormCheck, Accordion, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { faTrash, faEdit, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QuestionPreview from '../../../components/Question/QuestionPreview'; // Import the QuestionPreview component
import './QuestionsSection.css'; // Import the CSS file

const QuestionsSection = ({ questions, setQuestions }) => {
    const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(null);
    const addQuestionRef = useRef(null);

    useEffect (() => {
        console.log(`questions : ${JSON.stringify(questions)}`);
    },[questions])

    const handleQuestionEdit = (index) => {
        // Handle edit action for the selected question
        console.log(`Editing question at index: ${index}`);
    };

    const handleQuestionDelete = (index) => {
        const updatedQuestions = questions.filter((_, i) => i !== index);
        setQuestions(updatedQuestions);
        setSelectedQuestionIndex(null); // Clear selected question index
        console.log(`Deleted question at index: ${index}`);
    };

    const handleOptionChange = (questionIndex, optionIndex, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options[optionIndex] = value;
        setQuestions(updatedQuestions);
        console.log(`Option changed for question index: ${questionIndex}, option index: ${optionIndex}, value: ${value}`);
    };

    const handleCorrectAnswerToggle = (questionIndex, optionIndex) => {
        console.log(`handleCorrectAnswerToggle , questionIndex = ${questionIndex}, optionIndex = ${optionIndex}  `);
        const updatedQuestions = [...questions];
        const isChecked = updatedQuestions[questionIndex].correctAnswers.includes(optionIndex);
        console.log(`is checked? = ${isChecked}`);
        
        if (updatedQuestions[questionIndex].multipleAnswers) {
            // Allow multiple answers, toggle selection
            if (isChecked) {
                updatedQuestions[questionIndex].correctAnswers = updatedQuestions[questionIndex].correctAnswers.filter(index => index !== optionIndex);
            } else {
                updatedQuestions[questionIndex].correctAnswers.push(optionIndex);
            }
        } else {
            // Only one answer allowed, toggle selection if not already selected
            if (isChecked) {
                updatedQuestions[questionIndex].correctAnswers = [];
            } else {
                updatedQuestions[questionIndex].correctAnswers = [optionIndex];
            }
        }
        
        setQuestions(updatedQuestions);
        console.log(`Correct answer toggled for question index: ${questionIndex}, option index: ${optionIndex}`);
    };
    
    
    const addOption = (questionIndex) => {
        const updatedQuestions = [...questions];
        if (updatedQuestions[questionIndex].options.length < 10) {
            updatedQuestions[questionIndex].options.push('');
            setQuestions(updatedQuestions);
            console.log(`Added option for question index: ${questionIndex}`);
        } else {
            console.log(`Maximum options reached for question index: ${questionIndex}`);
        }
    };

    const handleOptionDelete = (questionIndex, optionIndex) => {
        const updatedQuestions = [...questions];
        updatedQuestions[questionIndex].options.splice(optionIndex, 1);
        setQuestions(updatedQuestions);
        console.log(`Deleted option for question index: ${questionIndex}, option index: ${optionIndex}`);
    };

    const addQuestion = () => {
        const newQuestion = {
            question: '',
            options: ['', ''],
            correctAnswers: [],
            multipleAnswers: false,
        };
        setQuestions([...questions, newQuestion]);
        console.log(`Added new question:`, newQuestion);
    };

    const handleQuestionChange = (index, field, value) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index][field] = value;
        setQuestions(updatedQuestions);
        console.log(`Question changed at index: ${index}, field: ${field}, value: ${value}`);
    };

    const toggleMultipleAnswers = (index) => {
        const updatedQuestions = [...questions];
        updatedQuestions[index].multipleAnswers = !updatedQuestions[index].multipleAnswers;
        
        if (!updatedQuestions[index].multipleAnswers && updatedQuestions[index].correctAnswers.length) {
            // If multiple answers are disallowed, clear all selected answers
            updatedQuestions[index].correctAnswers = [];
        }

        setQuestions(updatedQuestions);

        console.log(`Toggled multiple answers for question index: ${index}`);
    };

    return (
        <Container>
            <Row>
                <Col md={6}>
                    {questions.map((question, index) => (
                        <Accordion key={index} defaultActiveKey={0}>
                            <Accordion.Item eventKey={index}>
                                <Accordion.Header>
                                    Question {index + 1}
                                </Accordion.Header>
                                <Accordion.Body>
                                    {/* Question text */}
                                    <Form.Group controlId={`formQuestion${index}`} className="question-input">
                                        <Form.Label>Question {index + 1}:</Form.Label>
                                        <FormControl
                                            type="text"
                                            placeholder={`Enter question ${index + 1}`}
                                            value={question.question}
                                            onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                                        />
                                    </Form.Group>

                                    {/* Multiple answers allowed checkbox */}
                                    <Form.Group controlId={`formMultipleAnswers${index}`} className="multiple-answers-checkbox">
                                        <FormCheck
                                            type="checkbox"
                                            label="Allow Multiple Answers"
                                            checked={question.multipleAnswers}
                                            onChange={() => toggleMultipleAnswers(index)}
                                        />
                                    </Form.Group>

                                    {/* Options */}
                                    {question.options.map((option, optionIndex) => (
                                        <Form.Group key={optionIndex} controlId={`formOption${index}-${optionIndex}`} className="option-group">
                                            <div className="option-wrapper">
                                                <FormCheck
                                                    type={question.multipleAnswers && question.correctAnswers.length > 1 ? 'checkbox' : 'radio'}
                                                    label={`Option ${optionIndex + 1}: `}
                                                    checked={question.correctAnswers.includes(optionIndex)}
                                                    onChange={() => handleCorrectAnswerToggle(index, optionIndex)}
                                                />
                                                <FormControl
                                                    type="text"
                                                    placeholder={`Enter option ${optionIndex + 1}`}
                                                    value={option}
                                                    onChange={(e) => handleOptionChange(index, optionIndex, e.target.value)}
                                                    className="option-input"
                                                />
                                                {question.correctAnswers.includes(optionIndex) ? (
                                                    <span className="correct-option">&#10003;</span>
                                                ) : (
                                                    <span className="incorrect-option">&#x2717;</span>
                                                )}
                                                <OverlayTrigger
                                                    placement="top"
                                                    overlay={<Tooltip>Delete Option</Tooltip>}
                                                >
                                                    <Button variant="danger" size="sm" onClick={() => handleOptionDelete(index, optionIndex)}>
                                                        <FontAwesomeIcon icon={faTrash} />
                                                    </Button>
                                                </OverlayTrigger>
                                            </div>
                                        </Form.Group>
                                    ))}
                                    {question.options.length < 10 && (
                                        <OverlayTrigger
                                            placement="top"
                                            overlay={<Tooltip>Add Option</Tooltip>}
                                        >
                                            <Button variant="secondary" size="sm" onClick={() => addOption(index)}>
                                                <FontAwesomeIcon icon={faPlus} />
                                            </Button>
                                        </OverlayTrigger>
                                    )}
                                    <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Delete Question</Tooltip>}
                                    >
                                        <Button variant="danger" size="sm" onClick={() => handleQuestionDelete(index)}>
                                            <FontAwesomeIcon icon={faTrash} />
                                        </Button>
                                    </OverlayTrigger>
                                    {/* Edit question - needed? */}
                                    {/* <OverlayTrigger
                                        placement="top"
                                        overlay={<Tooltip>Edit Question</Tooltip>}
                                    >
                                        <Button variant="info" size="sm" onClick={() => handleQuestionEdit(index)}>
                                            <FontAwesomeIcon icon={faEdit} />
                                        </Button>
                                    </OverlayTrigger> */}
                                </Accordion.Body>
                            </Accordion.Item>
                        </Accordion>
                    ))}
                </Col>
                <Col md={6}>
                    <h4>Questions Preview</h4>
                    {questions.map((question, index) => (
                        <div key={index} className={`question-preview ${selectedQuestionIndex === index ? 'selected' : ''}`}>
                            <QuestionPreview question={question} index={index + 1} />
                        </div>
                    ))}
                </Col>
            </Row>
           
            {/* Sticky Add/Delete Question Buttons */}
            <div ref={addQuestionRef} style={{ position: 'sticky', bottom: '20px', right: '20px', zIndex: '1000' }}>
                <OverlayTrigger
                    placement="left"
                    overlay={<Tooltip>Add Question</Tooltip>}
                >
                    <Button variant="primary" size="m" onClick={addQuestion}>
                        <FontAwesomeIcon icon={faPlus}/>
                        Add Question
                    </Button>
                </OverlayTrigger>
               
            </div>
        </Container>
    );
};

export default QuestionsSection;
