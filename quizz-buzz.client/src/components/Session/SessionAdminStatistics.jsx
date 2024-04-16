import React from 'react';
import { Row, Col } from 'react-bootstrap';
import './SessionAdminStatistics.css';


const SessionAdminStatistics = ({ responses }) => {
    const questionStatistics = {};

    responses.forEach(response => {
        if (!questionStatistics[response.questionIndex]) {
            questionStatistics[response.questionIndex] = {
                numCorrect: 0,
                optionCounts: {}
            };
        }

        if (response.isCorrect) {
            questionStatistics[response.questionIndex].numCorrect++;
        }
    });

    return (
        <div className="session-admin-statistics">
            <h2>Session Admin Statistics</h2>
            {questionStatistics.lentgh > 0 ? (
                <Row>
                    {Object.entries(questionStatistics).map(([questionIndex, stats]) => (
                        <Col key={questionIndex} md={6}>
                            <div className="question-stats">
                                <h3>Question {parseInt(questionIndex) + 1}</h3>
                                <p>Number of correct answers: {stats.numCorrect}</p>
                            </div>
                        </Col>
                    ))}
                </Row>

            ):(
                <Row>
                    <Col>
                        <p>No responses recorded</p>
                    </Col>
                </Row>
            ) }
        </div>
    );
};

export default SessionAdminStatistics;
