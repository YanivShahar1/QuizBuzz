import React, { useState, useEffect } from 'react';
import { fetchQuizzes } from '../services/apiService'; // Update with your API service function

const QuizList = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const getQuizzes = async () => {
            try {
                const data = await fetchQuizzes(); // Function to fetch quizzes from API
                setQuizzes(data); // Update state with fetched quizzes
                setLoading(false); // Set loading to false once data is fetched
            } catch (error) {
                console.error('Error fetching quizzes:', error);
                setLoading(false); // Set loading to false in case of an error
            }
        };

        getQuizzes(); // Fetch quizzes when component mounts
    }, []);

    return (
        <div>
            <h2>Quiz List</h2>
            {loading ? (
                <p>Loading...</p>
            ) : quizzes.length === 0 ? (
                <p>No quizzes available</p>
            ) : (
                <ul>
                    {quizzes.map(quiz => (
                        <li key={quiz.id}>
                            <h3>{quiz.title}</h3>
                            <p>Description: {quiz.description}</p>
                            {/* Render other quiz details */}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default QuizList;
