import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import SessionService from '../services/SessionService';
import './WaitingRoom.css';


const WaitingRoom = () => {
    const { sessionId } = useParams();
    const [students, setStudents] = useState([]);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const sessionStudents = await SessionService.getSessionStudents(sessionId);
                console.log(`in fetch students of waitin room with sessionId: ${sessionId}`)
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


    const handleCopySessionId = () => {
        navigator.clipboard.writeText(sessionId)
            .then(() => {
                console.log(`session id copied to clipboard!`);
            })
            .catch((error) => {
                console.error('Error copying session ID:', error);
            });
    };

    return (
        <div className='waiting-room'>
            <h2>Waiting Room</h2>
            <div className='session-info'>
            <label className="session-label">
                Session ID:
            </label>
            <span className="session-id">
                {sessionId}{' '}
                <span
                    role="img"
                    aria-label="copy"
                    title="Copy"
                    className="copy-icon"
                    onClick={handleCopySessionId}
                >
                    &#x1F4CB;
                </span>
            </span>

                <div className='students-list'>
                    <h4>Students Joined:</h4>
                    <ul>
                        {students.map((student, index) => (
                            <li key={index}>{student.username}</li>
                        ))}
                    </ul>
                </div>
                <button onClick={handleStartSession}>Start Session</button>    
            </div>
        </div>
    );
};

export default WaitingRoom;
