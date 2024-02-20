// QuizResultsPage.jsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

const QuizResultsPage = () => {
    const { quizId } = useParams();
    const [quizResults, setQuizResults] = useState(null);

    useEffect(() => {
        // Fetch quiz results when component mounts
        const fetchQuizResults = async () => {
            try {
                const response = await fetch(`/api/quiz/results/${quizId}`);
                if (response.ok) {
                    const resultsData = await response.json();
                    setQuizResults(resultsData);
                } else {
                    console.error('Failed to fetch quiz results. Server returned:', response.status);
                }
            } catch (error) {
                console.error('Error fetching quiz results:', error);
            }
        };

        fetchQuizResults();
    }, [quizId]);

    return (
        <div className="container mt-5">
            <h2>Quiz Results</h2>
            {quizResults ? (
                <div>
                    <h3>{quizResults.quizTitle}</h3>
                    <p>Your Score: {quizResults.userScore}</p>
                    {/* Render additional result details */}
                </div>
            ) : (
                <p>Loading quiz results...</p>
            )}
        </div>
    );
};

export default QuizResultsPage;
