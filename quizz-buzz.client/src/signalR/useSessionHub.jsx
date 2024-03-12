import { useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const useSessionHub = () => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const startConnection = async () => {
            try {
                const newConnection = new HubConnectionBuilder()
                    .withUrl("https://localhost:7141/sessionHub")
                    .configureLogging(LogLevel.Debug)
                    .build();

                await newConnection.start();
                console.log("SignalR connection established");
                setConnection(newConnection);
            } catch (error) {
                console.error("Error establishing SignalR connection:", error);
            }
        };

        startConnection();

        return () => {
            if (connection) {
                connection.stop();
                console.log("SignalR connection stopped");
            }
        };
    }, []);

    return connection;
};

export default useSessionHub;
