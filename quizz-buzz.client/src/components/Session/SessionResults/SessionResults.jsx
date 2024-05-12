import React from 'react';
import { Table, Container } from 'react-bootstrap';
import './SessionResults.css'; // Import CSS for styling
import SessionService from '../../../services/SessionService';

const SessionResults = ({ data }) => {
    // Check if leaderboardData or participantResults is defined before sorting
    if (!data || !data.participantResults) return null;

    // Sort participant results by number of correct answers in descending order
    // const sortedParticipants = [...data.participantResults].sort((a, b) => b.score - a.score);
    const sortedParticipants = [...data.participantResults].sort((a, b) => {
        // Compare based on number of correct answers
        console.log(`comparing : a = ${a}, b = ${b}`);
        if (a.numCorrectAnswers !== b.numCorrectAnswers) {
            console.log(`based #answers, ${b.numCorrectAnswers - a.numCorrectAnswers}`)
            return b.numCorrectAnswers - a.numCorrectAnswers; // Sort in descending order of correct answers
        } else {
            // If correct answers are the same, compare based on average response time
            console.log(`based #time, ${a.averageResponseTime - b.averageResponseTime}`)
            
            return a.AverageResponseTime - b.AverageResponseTime; // Sort in ascending order of response time
        }
    });
    
    // Get top 3 participants
    const topParticipants = sortedParticipants.slice(0, 3);

    return (
        <Container className="leaderboard-container">
            <h2>Results:</h2>
            <Table striped bordered hover>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Nickname</th>
                        <th>#Correct Answers</th>
                        <th>Average Response Time (sec)</th>
                    </tr>
                </thead>
                <tbody>
                    {topParticipants.map((participant, index) => (
                        <tr key={index}>
                            <td>{index + 1}</td>
                            <td>{participant.nickname}</td>
                            <td>{participant.numCorrectAnswers}</td>
                            <td>{(participant.averageResponseTime/1000).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
            {/* TODO -  show next participants to session host only or also to participants */}
            {sortedParticipants.length > 3 && (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Nickname</th>
                            <th>Number of Correct Answers</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedParticipants.slice(3).map((participant, index) => (
                            <tr key={index}>
                                <td>{participant.nickname}</td>
                                <td>{participant.numCorrectAnswers}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}
        </Container>
    );
};

export default SessionResults;
