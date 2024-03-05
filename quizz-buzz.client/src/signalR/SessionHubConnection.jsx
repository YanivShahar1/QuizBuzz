import { HubConnectionBuilder } from '@microsoft/signalr';

const SessionHubConnection = () => {
    const hubConnection = new HubConnectionBuilder()
        .withUrl('/sessionHub') // Assuming your hub endpoint is '/sessionHub'
        .withAutomaticReconnect()
        .build();

    const startConnection = async () => {
        try {
            await hubConnection.start();
            console.log('SignalR connection started.');
        } catch (error) {
            console.error('Error starting SignalR connection:', error);
        }
    };

    const stopConnection = async () => {
        try {
            await hubConnection.stop();
            console.log('SignalR connection stopped.');
        } catch (error) {
            console.error('Error stopping SignalR connection:', error);
        }
    };

    const addHubListeners = () => {
        // Add listeners for hub events here
        hubConnection.on('SessionCreated', (sessionId, username) => {
            console.log(`Session created: ${sessionId} by ${username}`);
            // Add your logic here to handle session created event
        });

        hubConnection.on('SessionUpdated', (sessionId, username) => {
            console.log(`Session updated: ${sessionId} by ${username}`);
            // Add your logic here to handle session updated event
        });

        hubConnection.on('SessionDeleted', (sessionId, username) => {
            console.log(`Session deleted: ${sessionId} by ${username}`);
            // Add your logic here to handle session deleted event
        });

        hubConnection.on('UserJoined', (sessionId, userNickname) => {
            console.log(`User ${userNickname} joined session ${sessionId}`);
            // Add your logic here to handle user joined event
        });
    };

    // Start the connection and add listeners when component mounts
    useEffect(() => {
        startConnection();
        addHubListeners();

        // Cleanup: Stop connection and remove listeners when component unmounts
        return () => {
            stopConnection();
        };
    }, []);

    return null; // This component doesn't render anything
};

export default SessionHubConnection;
