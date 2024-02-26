import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SessionService from '../services/SessionService';

const WaitingRoom = () => {
    const { sessionId } = useParams();
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const sessionStudents = await SessionService.getSessionStudents(sessionId);
                setStudents(sessionStudents);
            } catch (error) {
                console.error('Error fetching session students:', error);
            }
        };

        fetchStudents();
    }, [sessionId]);

    const handleStartSession = async () => {
        try {
            await SessionService.startSession(sessionId);
            // Redirect to the session page or any other page as needed
            // navigate(`/session/${sessionId}`);
        } catch (error) {
            console.error('Error starting session:', error);
        }
    };

    return (
        <div>
            <h2>Waiting Room</h2>
            <h3>Session ID: {sessionId}</h3>
            <h4>Students Joined:</h4>
            <ul>
                {students.map((student, index) => (
                    <li key={index}>{student.username}</li>
                ))}
            </ul>
            <button onClick={handleStartSession}>Start Session</button>
        </div>
    );
};

export default WaitingRoom;
