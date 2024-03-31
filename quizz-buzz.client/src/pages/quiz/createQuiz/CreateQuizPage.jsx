
import React, { useState, useEffect } from 'react';
import { Accordion, Card, Button, Form, Row, Col, Badge } from 'react-bootstrap';
// import './CreateQuizPage.css';
import InfoSection from './InfoSection';
import QuestionsSection from './QuestionsSection';
import QuizService from '../../../services/QuizService';
import { useNavigate } from 'react-router-dom';
import AuthService from '../../../services/AuthService';    

const CreateQuizPage = () => {
    console.log(`in CreateQuizPage : 1`);
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [quizInfoCollapsed, setQuizInfoCollapsed] = useState(true);
    const [questionsCollapsed, setQuestionsCollapsed] = useState(true);
    const [ loading, setLoading ] = useState(false);
    const [error, setError] = useState(null);
    console.log(`in CreateQuizPage : 2`);


    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await QuizService.fetchCategories();
                setCategories(categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                // Optionally, you can set an error state or show an error message to the user
                setError('An error occurred while fetching categories. Please try again.');
            }
        };
    
        fetchCategories();
    }, []);
    
    useEffect(()=>{
        console.log(`categories updated: ${categories.length}`);
    },[categories])

    const [quizInfo, setQuizInfo] = useState({
        title: '',
        category: '',
        description: '',
        isPublic: false,
      });
    
    const handleInfoChange = (newInfo) => {
        setQuizInfo(newInfo);
    };
    // const [categories, setCategories] = useState([]);
    const mockCategories = ['General Knowledge', 'Science', 'History', 'Geography', 'Technology', 'Sports', 'Music', 'Movies', 'Literature', 'Mathematics'];
    console.log(`in CreateQuizPage : 3`);

    // useEffect(() => {
    //     setCategories(mockCategories.map(category => ({ value: category, label: category })));
    // }, [mockCategories]);

    const handleQuizSubmission = async () => {
        try {
            setLoading(true);
            const quizData = {
                hostUserId: AuthService.getSessionUsername(),
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

            console.log(`want to submit wuiz - > ${quizData}`);
            // Submit the quiz data to the server
            const createdQuizID = await QuizService.submitQuiz(quizData);
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

    const [questions, setQuestions] = useState([]);

    console.log(`in CreateQuizPage : 4`);

    const canSubmit = () => {
        return 1;
        //return questions.length > 0 && questions.every(question => question.correctAnswers.length > 0 && question.options.length >= 2);
    };

    console.log(`in CreateQuizPage : 5`);

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
                                info={quizInfo}
                                onInfoChange={handleInfoChange}
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