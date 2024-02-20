import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import QuizService from '../../services/QuizService';
import { faTrashAlt, faEdit, faEye, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '../../utils/dateUtils';
import CreateQuizButton from '../../components/Quiz/Buttons/CreateQuizButton';
import QuizSignalRService from '../../services/signalR/QuizSignalRService';

const QuizzesSection = ({ userName }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [quizzes, setQuizzes] = useState([]);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const toggleCollapse = () => {
        setIsCollapsed(!isCollapsed);
    };

    useEffect(() => {
        const fetchUserQuizzes = async () => {
            try {
                setIsLoading(true);
                console.log(`Fetching quizzes for ${userName}...`);
                const userQuizzes = await QuizService.fetchUserQuizzes(userName);
                setQuizzes(userQuizzes);
                setIsLoading(false);
            } catch (error) {
                console.error('Error fetching quizzes:', error);
            }
        };

        fetchUserQuizzes();

    }, [userName]);

    const handleDeleteQuiz = async (quizId) => {
        try {
            const confirmDelete = window.confirm("Are you sure you want to delete this quiz?");
            if (!confirmDelete) {
                return;
            }

            await QuizService.deleteQuiz(quizId);
            setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.quizID !== quizId));
            alert("Quiz deleted successfully.");
        } catch (error) {
            console.error('Error deleting quiz:', error);
            alert("An error occurred while deleting the quiz. Please try again later.");
        }
    };

    if (isLoading) {
        return <p>Loading...</p>;
    }

    return (
        <div>
            <h2 onClick={toggleCollapse}>
                <FontAwesomeIcon icon={isCollapsed ? faAngleDown : faAngleUp} />
                Quizzes
            </h2>

            {!isCollapsed && (
                <div>
                    {quizzes.length > 0 ? (
                        <>
                            <h5>Here are your quizzes:</h5>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div></div>
                                <CreateQuizButton />
                            </div>
                            <div className="table-responsive">
                                <table className="table table-striped">
                                    <thead>
                                        <tr>
                                            <th scope="col">#</th>
                                            <th scope="col" className="col-2">Title</th>
                                            <th scope="col" className="col-2">Date Created</th>
                                            <th scope="col" className="col-2">Last Updated</th>
                                            <th scope="col" className="col-2">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {quizzes.map((quiz, index) => (
                                            <tr key={quiz.quizID}>
                                                <th scope="row" className="col-1">{index + 1}</th>
                                                <td className="col-1">{quiz.title}</td>
                                                <td className="col-1">{formatDate(quiz.createdAt)}</td>
                                                <td className="col-1">{formatDate(quiz.updatedAt)}</td>
                                                <td className="col-1">
                                                    <button onClick={() => handleDeleteQuiz(quiz.quizID)} className="btn btn-danger mr-2">
                                                        <FontAwesomeIcon icon={faTrashAlt} title="Delete" />
                                                    </button>
                                                    <button className="btn btn-primary mr-2">
                                                        <FontAwesomeIcon icon={faEdit} title="Edit" />
                                                    </button>
                                                    <button className="btn btn-success">
                                                        <FontAwesomeIcon icon={faEye} title="Preview" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    ) : (
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div></div>
                            <p>No quizzes available. Why not create one?</p>
                            <CreateQuizButton />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default QuizzesSection;
