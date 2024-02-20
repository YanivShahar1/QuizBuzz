import React from 'react';

const QuizQuestion = ({ question, userAnswer, handleAnswerChange, handleAnswerSubmit, timer }) => {
    const isTimerExpired = timer === 0;

    return (
        <div>
            <h2>{question.questionText}</h2>
            <ul>
                {question.options.map((option, index) => (
                    <li key={index}>
                        <label>
                            <input
                                type={question.isMultipleAnswerAllowed ? 'checkbox' : 'radio'}
                                name="answer"
                                value={index}
                                checked={userAnswer && userAnswer.includes(index)}
                                onChange={() => handleAnswerChange(index)}
                                disabled={isTimerExpired} // Disable input when timer is expired
                            />
                            {option}
                        </label>
                    </li>
                ))}
            </ul>
            <p>Time remaining: {timer} seconds</p>
            <button onClick={handleAnswerSubmit} disabled={isTimerExpired}>
                Submit Answer
            </button>
        </div>
    );
};

export default QuizQuestion;
