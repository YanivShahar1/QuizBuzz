import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt, faEdit, faEye, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import QuizService from '../../services/QuizService';
import { formatDate,compareDatesDescending } from '../../utils/dateUtils';
import CreateQuizButton from '../../components/Quiz/CreateQuizButton/CreateQuizButton';
import { Row, Col, Button, Modal } from 'react-bootstrap';
import './UserSessions.css';
import EditQuizModal from '../../components/Quiz/EditQuizModal/EditQuizModal';
import QuestionPreview from '../../components/Question/QuestionPreview/QuestionPreview';


const UserQuizzes = ({ userName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [quizzes, setQuizzes] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    const [ShowPreviewModal, setShowPreviewModal] = useState(false); // Define ShowPreviewModal state
    const [selectedQuiz, setSelectedQuiz] = useState(null); // State to store the selected quiz
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedQuizzes, setSelectedQuizzes] = useState([]);

    const sortUserQuizzes = (quizzes) => {
        quizzes.sort((a, b) => compareDatesDescending(a.createdAt, b.createdAt));
    };

    useEffect(() => {
        const fetchUserQuizzes = async () => {
            try {
                setIsLoading(true);
                const userQuizzes = await QuizService.FetchUserQuizzes(userName);
                sortUserQuizzes(userQuizzes);
                await setQuizzes(userQuizzes);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };

        fetchUserQuizzes();
    }, [userName]);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    const handleDeleteQuiz = async (quizId) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this quiz?");
            if (!confirmDelete) return;

            await QuizService.deleteQuiz(quizId);
            setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.quizID !== quizId));
            alert("Quiz deleted successfully.");
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert("An error occurred while deleting the quiz. Please try again later.");
        }
    };

    const handleEditQuiz = async (quiz) => {
        setShowEditModal(true);
        setSelectedQuiz(quiz);
        
    };
    
    const handlePreviewQuiz = async (quiz) => {
        try {
            // Logic to navigate to the quiz preview page or open a preview modal
            console.log(`Previewing quiz with ID: ${quiz.quizID}`);
            setShowPreviewModal(true); // Set ShowPreviewModal state to true to show the modal
            setSelectedQuiz(quiz); // Store the selected quiz ID in state
        } catch (error) {
            console.error('Error previewing quiz:', error);
            alert("An error occurred while previewing the quiz. Please try again later.");
        }
    };

    const handleCheckboxChange = (quizId) => {
        if (selectedQuizzes.includes(quizId)) {
            setSelectedQuizzes(selectedQuizzes.filter(id => id !== quizId));
        } else {
            setSelectedQuizzes([...selectedQuizzes, quizId]);
        }
    };

    const handleDeleteSelectedQuizzes = async () => {
        try {
            const confirmDelete = window.confirm(`Are you sure you want to delete ${selectedQuizzes.length} quizzes?`);
            if (!confirmDelete) return;
    
            await QuizService.deleteQuizzes(selectedQuizzes);
            setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => !selectedQuizzes.includes(quiz.quizID)));
            setSelectedQuizzes([]);
            alert("Selected quizzes deleted successfully.");
        } catch (error) {
            console.error('Error deleting quizzes:', error);
            alert("An error occurred while deleting the selected quizzes. Please try again later.");
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <Row>
                {quizzes.length > 0 ? (
                    <>
                        <h5>Here are your quizzes:</h5>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <CreateQuizButton />
                        </div>
                        {/* Delete Selected Quizzes Button */}
                        {selectedQuizzes.length > 0 && (
                            <Button variant="danger" onClick={handleDeleteSelectedQuizzes}>
                                Delete Selected Quizzes
                            </Button>
                        )}
                        <div className="table-responsive">
                            <table className="table table-striped quizzes-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Date Created</th>
                                        <th>Last Updated</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {quizzes.map((quiz, index) => (
                                        <tr key={quiz.quizID}>
                                            <td>{quiz.title}</td>
                                            <td>{formatDate(quiz.createdAt)}</td>
                                            <td>{formatDate(quiz.updatedAt)}</td>
                                            <td className="action-buttons">
                                                <Button variant="danger" className="mr-2" onClick={() => handleDeleteQuiz(quiz.quizID)}>
                                                    <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                                </Button>
                                                <Button variant="primary" className="mr-2" onClick={() => handleEditQuiz(quiz)}>
                                                    <FontAwesomeIcon icon={faEdit} title="Edit" />
                                                </Button>
                                                <Button variant="success" onClick={() => handlePreviewQuiz(quiz)}>
                                                    <FontAwesomeIcon icon={faEye} title="Preview" />
                                                </Button>
                                            </td>
                                            <td>
                                                <input type="checkbox" checked={selectedQuizzes.includes(quiz.quizID)} onChange={() => handleCheckboxChange(quiz.quizID)} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <Col>
                        <p>No quizzes available. Why not create one?</p>
                        <CreateQuizButton />
                    </Col>
                )}
            </Row>
            {/* Preview Quiz Modal */}
            <Modal show={ShowPreviewModal} onHide={() => setShowPreviewModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Preview Quiz</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPreviewModal(false)}>
                        Close
                    </Button>
                    {/* Additional action buttons can be added here if needed */}
                </Modal.Footer>
            </Modal>

            {/* Edit Quiz Modal */}
            <EditQuizModal
                quiz={selectedQuiz}
                show={showEditModal}
                onClose={() => setShowEditModal(false)}
                onSave={(updatedQuiz) => console.log(updatedQuiz)}
            />
        </div>
    );
};

export default UserQuizzes;
