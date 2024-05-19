import React, { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';

import './SessionAdminStatistics.css';


const SessionAdminStatistics = ({ responses }) => {
    const [questionStatistics, setQuestionStatistics] = useState({});

    useEffect(() => {
        console.log(`responses: ${JSON.stringify(responses)}`);
    }, [responses]);

    useEffect(() => {
        console.log(`questionStatistics changed: ${JSON.stringify(questionStatistics)}`);
        console.log(`questionStatistics size: ${Object.keys(questionStatistics).length}`);
    }, [questionStatistics]);

    useEffect(() => {
        // Calculate question statistics when responses change
        const stats = {};
        responses.forEach(response => {
            if (!stats[response.questionIndex]) {
                stats[response.questionIndex] = {
                    numCorrect: 0,
                    optionCounts: {}
                };
            }

            if (response.isCorrect) {
                stats[response.questionIndex].numCorrect++;
            }
        });
        setQuestionStatistics(stats);
    }, [responses]);


   

    return (
        <div className="session-admin-statistics">
            <h2>Session Admin Statistics</h2>
            {Object.keys(questionStatistics).length > 0 ? (
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
            ) : (
                <Row>
                    <Col>
                        <p>No responses recorded</p>
                    </Col>
                </Row>
            )}
        </div>
    );
};

export default SessionAdminStatistics;
