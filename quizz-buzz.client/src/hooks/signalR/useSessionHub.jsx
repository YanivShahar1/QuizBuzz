import { useEffect, useState } from 'react';
import { HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

const useSessionHub = () => {
    const [connection, setConnection] = useState(null);

    useEffect(() => {
        const startConnection = async () => {
            const newConnection = new HubConnectionBuilder()
                .withUrl("https://localhost:7141/sessionHub")
                .configureLogging(LogLevel.Debug)
                .withAutomaticReconnect() 
                .build();

            newConnection.onclose(error => {
                if (error) {
                    console.error('Connection closed due to error:', error);
                } else {
                    console.log('Connection closed');
                }
            });

            newConnection.onreconnecting(error => {
                console.warn('Connection lost due to error. Reconnecting.', error);
            });

            newConnection.onreconnected(connectionId => {
                console.log('Connection reestablished. Connected with connectionId', connectionId);
            });

            try {
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
                connection.stop()
                    .then(() => console.log("SignalR connection stopped"))
                    .catch(error => console.error("Error stopping SignalR connection:", error));
            }
        };
    }, []);

    return connection;
};

export default useSessionHub;
