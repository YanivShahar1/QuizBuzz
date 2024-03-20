import React, { useState , useEffect} from 'react';

const QuizQuestion = ({ question, userAnswer, handleAnswerChange, handleAnswerSubmit, timer }) => {
    const isTimerExpired = timer === 0;

    const [answerSubmitted, setAnswerSubmitted] = useState(false);

    useEffect(() => {
        // Reset answerSubmitted when the question changes
        setAnswerSubmitted(false);
    }, [question]);

    const handleAnswerSelection = index => {
        handleAnswerChange(index);
    };

    const handleSubmitClick = () => {
        handleAnswerSubmit();
        setAnswerSubmitted(true); 
    };


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
                                onChange={() => handleAnswerSelection(index)}
                                disabled={isTimerExpired} // Disable input when timer is expired
                            />
                            {option}
                        </label>
                    </li>
                ))}
            </ul>
            {!answerSubmitted && 
                <div>
                    <p>Time remaining: {timer} seconds</p>
                    <button onClick={handleSubmitClick} disabled={ isTimerExpired || answerSubmitted}>
                        Submit Answer
                    </button>
                
                </div>}
            {answerSubmitted && <p>waiting for other players to finish, left time : {timer}</p>}
            
        </div>
    );
};

export default QuizQuestion;
