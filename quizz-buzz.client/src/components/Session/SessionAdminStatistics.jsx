import React from 'react';

const SessionAdminStatistics = ({ responses }) => {
    // Initialize an object to store statistics for each question
    const questionStatistics = {};

    console.log("Initial questionStatistics:", JSON.stringify(questionStatistics));

    // Iterate over each response
    responses.forEach(response => {
        console.log("Processing response:", JSON.stringify(response));

        // If this is the first time encountering this question, initialize its statistics object
        if (!questionStatistics[response.questionIndex]) {
            questionStatistics[response.questionIndex] = {
                numCorrect: 0,
                optionCounts: {}
            };
            console.log("Initialized questionStatistics for question", response.questionIndex, ":", JSON.stringify(questionStatistics[response.questionIndex]));
        }

        // Update the number of correct answers for this question
        if (response.isCorrect) {
            questionStatistics[response.questionIndex].numCorrect++;
            console.log("Updated numCorrect for question", response.questionIndex, ":", questionStatistics[response.questionIndex].numCorrect);
        }

        // Update the count for each selected option for this question
        response.selectedOptions.forEach(option => {
            if (!questionStatistics[response.questionIndex].optionCounts[option]) {
                questionStatistics[response.questionIndex].optionCounts[option] = 0;
            }
            questionStatistics[response.questionIndex].optionCounts[option]++;
            console.log("Updated option count for question", response.questionIndex, ", option", option, ":", questionStatistics[response.questionIndex].optionCounts[option]);
        });
    });

    console.log("Final questionStatistics:", JSON.stringify(questionStatistics));

    return (
        <div>
            <h2>Session Admin Statistics</h2>
            {/* Display statistics for each question */}
            {Object.entries(questionStatistics).map(([questionIndex, stats]) => (
                <div key={questionIndex}>
                    <h3>Question {questionIndex}</h3>
                    <p>Number of correct answers: {stats.numCorrect}</p>
                    <h4>Option Counts:</h4>
                    {/* Display count for each option */}
                    <ul>
                        {Object.entries(stats.optionCounts).map(([option, count]) => (
                            <li key={option}>Option {option}: {count}</li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default SessionAdminStatistics;
