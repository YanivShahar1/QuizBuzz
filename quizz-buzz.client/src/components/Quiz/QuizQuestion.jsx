import React, { useState , useEffect} from 'react';

const QuizQuestion = ({ question, userAnswer, handleAnswerChange, handleAnswerSubmit }) => {

    const [answerSubmitted, setAnswerSubmitted] = useState(false);
    const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

    useEffect(() => {
        // Reset answerSubmitted when the question changes
        setAnswerSubmitted(false);
        setIsSubmitDisabled(false)
    }, [question]);

    useEffect(() => {
        if (userAnswer !== null && userAnswer.length > 0) {
            console.log("more than 1 answer");
            setIsSubmitDisabled(false);
        } else {
            console.log("no answers yet");
            
            setIsSubmitDisabled(true);
        }
    }, [userAnswer]);
    
    const handleAnswerSelection = index => {
        handleAnswerChange(index);
    };

    const handleSubmitClick = () => {
        setAnswerSubmitted(true); 
        handleAnswerSubmit();

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
                                disabled={answerSubmitted} // Disable input when timer is expired
                            />
                            {option}
                        </label>
                    </li>
                ))}
            </ul>
            {!answerSubmitted && 
                <div>
                    <button onClick={handleSubmitClick} disabled={isSubmitDisabled}>
                        Submit Answer
                    </button>
                
                </div>}
            {answerSubmitted && <p>waiting for other players to finish</p>}
            
        </div>
    );
};

export default QuizQuestion;
