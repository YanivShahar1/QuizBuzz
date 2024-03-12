import React, { useState, useEffect } from 'react';

const SessionStatistics = ({ sessionConnection }) => {
    const [statistics, setStatistics] = useState(null);

    // Subscribe to real-time updates from the session connection
    useEffect(() => {
        if (!sessionConnection) return;

        // Set up event handlers to receive real-time statistics updates
        sessionConnection.on('StatisticsUpdated', updatedStatistics => {
            setStatistics(updatedStatistics);
        });

        // Cleanup when component unmounts
        return () => {
            sessionConnection.off('StatisticsUpdated');
        };
    }, [sessionConnection]);

    if (!statistics) {
        return <p>Loading statistics...</p>;
    }

    // Render the statistics data
    return (
        <div>
            <h1>Session Statistics</h1>
            {/* Render statistics data here */}
        </div>
    );
};

export default SessionStatistics;
