
import React, { useState, useEffect } from 'react';
import { Accordion, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';
import './CreateQuizPage.css';
import InfoSection from './InfoSection';
import QuestionsSection from './QuestionsSection';
import QuizService from '../../../services/QuizService';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/AuthService';    

const CreateQuizPage = () => {
    const navigate = useNavigate();

    const [ loading, setLoading ] = useState(false);
    const [error, setError] = useState(null);

    const handleQuizSubmission = async () => {
        try {
            setLoading(true);
            const quizData = {
                hostUserId: AuthService.getCurrentLogedInUserName(),
                title: quizInfo.title,
                category: quizInfo.category,
                description: quizInfo.description,
                questions: questions.map(question => ({
                    questionText: question.question,
                    options: question.options,
                    correctOptions: question.correctAnswers,
                    isMultipleAnswerAllowed: question.multipleAnswers
                })),
            };

            const romeQuizData = {
                hostUserId: AuthService.getCurrentLogedInUserName(),
                title: "Rome Through the Ages Quiz",
                category: "History",
                description: "Test your knowledge of Rome's rich history and legacy",
                questions: [
                    {
                        questionText: "Who was the legendary founder of Rome?",
                        options: ["Julius Caesar", "Romulus", "Augustus", "Nero"],
                        correctOptions: [1],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Which emperor commissioned the construction of the Colosseum?",
                        options: ["Nero", "Trajan", "Titus", "Hadrian"],
                        correctOptions: [2],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Who was the first Roman Emperor?",
                        options: ["Julius Caesar", "Mark Antony", "Augustus", "Caligula"],
                        correctOptions: [2],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Which event marked the fall of the Western Roman Empire?",
                        options: ["Sack of Rome", "Battle of Actium", "Death of Julius Caesar", "Construction of Hadrian's Wall"],
                        correctOptions: [0],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Who wrote the epic poem 'The Aeneid', which tells the story of the Trojan hero Aeneas and the founding of Rome?",
                        options: ["Homer", "Virgil", "Ovid", "Horace"],
                        correctOptions: [1],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Which Roman emperor famously declared himself a god?",
                        options: ["Augustus", "Caligula", "Nero", "Constantine"],
                        correctOptions: [2],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Which architectural feature was characteristic of Roman aqueducts?",
                        options: ["Arches", "Domes", "Pillars", "Vaults"],
                        correctOptions: [0],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Who was the Roman general known for his crossing of the Alps with elephants during the Second Punic War?",
                        options: ["Julius Caesar", "Scipio Africanus", "Hannibal", "Tiberius Gracchus"],
                        correctOptions: [2],
                        isMultipleAnswerAllowed: false
                    },
                    {
                        questionText: "Which Roman leader famously declared 'Veni, vidi, vici' ('I came, I saw, I conquered')?",
                        options: ["Julius Caesar", "Augustus", "Mark Antony", "Cicero"],
                        correctOptions: [0],
                        isMultipleAnswerAllowed: false
                    }
                ]
            };




            // Submit the quiz data to the server
            const createdQuizID = await QuizService.submitQuiz(romeQuizData);
            alert(`Quiz submitted successfully! Quiz ID: ${createdQuizID}`);
            // Redirect to the dashboard
            navigate('/dashboard');
            // Optionally, you can perform additional actions upon successful submission
            // For example, redirect the user to a success page, show a success message, etc.

        } catch (error) {
            // Handle errors (e.g., display an error message to the user)
            console.error('Error submitting quiz:', error);

            // Optionally, you can set an error state or show an error message to the user
            setError('An error occurred while submitting the quiz. Please try again.');

        } finally {
            // Reset the loading state (e.g., hide the loading spinner)
        }
    };

    const [quizInfoCollapsed, setQuizInfoCollapsed] = useState(true);
    const [questionsCollapsed, setQuestionsCollapsed] = useState(true);

    const [quizInfo, setQuizInfo] = useState({
        title: '',
        category: '',
        description: '',
    });

    const [collapsedQuestions, setCollapsedQuestions] = useState([]);


    const [categories, setCategories] = useState([]);
    const mockCategories = ['General Knowledge', 'Science', 'History', 'Geography', 'Technology', 'Sports', 'Music', 'Movies', 'Literature', 'Mathematics'];

    useEffect(() => {
        setCategories(mockCategories.map(category => ({ value: category, label: category })));
    }, []);

    const [questions, setQuestions] = useState([]);


    const handleQuizInfoChange = (field, value) => {
        console.log('Before state update:', quizInfo);
        console.log('value', value);

        setQuizInfo(prevState => {
            const nextState = {
                ...prevState,
                [field]: typeof value === 'object' ? value.value : value,
            };

            console.log(`Updating ${field} with value:`, nextState[field]);
            console.log('After state update:', nextState);

            return nextState;
        });
    };

    const canSubmit = () => {
        return 1;
        //return questions.length > 0 && questions.every(question => question.correctAnswers.length > 0 && question.options.length >= 2);
    };


    return (
        <div className="container mt-5">
            <h1>Create Your Own Quiz</h1>
            <div className="accordion" id="quizDetailsAccordion">
                {/* Quiz Info Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header" id="quizInfoHeading">
                        <button
                            className="accordion-button"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#quizInfoCollapse"
                            aria-expanded={quizInfoCollapsed}
                            aria-controls="quizInfoCollapse"
                            onClick={() => setQuizInfoCollapsed(!quizInfoCollapsed)}
                        >
                            General Quiz Info
                        </button>
                    </h2>
                    <div
                        id="quizInfoCollapse"
                        className={`accordion-collapse collapse ${quizInfoCollapsed ? '' : 'show'}`}
                        aria-labelledby="quizInfoHeading"
                    >
                        <div className="accordion-body">
                            <InfoSection
                                quizInfo={quizInfo}
                                handleQuizInfoChange={handleQuizInfoChange}
                                categories={categories}
                            />
                        </div>
                    </div>
                </div>
                {/* Quiz Question Section */}
                <div className="accordion-item">
                    <h2 className="accordion-header" id="quizQuestionsHeading">
                        <button
                            className="accordion-button collapsed"
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target="#quizQuestionsCollapse"
                            aria-expanded={!questionsCollapsed}
                            aria-controls="quizQuestionsCollapse"
                            onClick={() => setQuestionsCollapsed(!questionsCollapsed)}
                        >
                            Quiz Questions
                        </button>
                    </h2>
                    <div
                        id="quizQuestionsCollapse"
                        className={`accordion-collapse collapse ${questionsCollapsed ? '' : 'show'}`}
                        aria-labelledby="quizQuestionsHeading"
                    >
                        <div className="accordion-body">
                            <QuestionsSection
                                questions={questions}
                                setQuestions={setQuestions}
                            />
                           
                        </div>
                        {canSubmit() && (
                            <Button variant="success" className="mt-3" onClick={handleQuizSubmission}>
                                {loading ? 'Submitting...' : 'Submit Quiz'}
                            </Button>
                        )}

                        {error && <div className="error-message">{error}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuizPage;