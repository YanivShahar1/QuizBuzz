import React from 'react';
import './Leaderboard.css'; // Import CSS for styling

const Leaderboard = ({ leaderboardData, isHost }) => {
    // Check if leaderboardData or participantResults is defined before sorting
    if (!leaderboardData || !leaderboardData.participantResults) return null;

    // Sort participant results by number of correct answers in descending order
    const sortedParticipants = [...leaderboardData.participantResults].sort((a, b) => b.score - a.score);

    // Get top 3 participants
    const topParticipants = sortedParticipants.slice(0, 3);

    console.log(`leaderboard data -> ${leaderboardData}`);
    return (
        <div className="leaderboard-container">
            <h2>Leaderboard</h2>
            <div className="top-players">
                <ol>
                    {topParticipants.map((participant, index) => (
                        <li key={index} className="top-player">
                            <span>{index + 1}</span>
                            <span>{participant.nickname}</span>
                            <span>{participant.score}</span>
                        </li>
                    ))}
                </ol>
            </div>
            {isHost() && sortedParticipants.length > 3 && (
                <div className="other-players">
                    <h3>Other Players</h3>
                    <ol start={4}>
                        {sortedParticipants.slice(3).map((participant, index) => (
                            <li key={index}>
                                <span>{participant.nickname}</span>
                                <span>{participant.numCorrectAnswers}</span>
                            </li>
                        ))}
                    </ol>
                </div>
            )}
        </div>
    );
};

export default Leaderboard;
