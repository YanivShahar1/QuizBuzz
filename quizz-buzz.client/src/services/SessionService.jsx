const SessionService = {
    backendUrl : "https://localhost:7141/api/session/",
    submitSession: async (sessionData) => {
        try {
            const response = await fetch(SessionService.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(sessionData),
            });

            if (response.ok) {
                const createdSession = await response.json();
                return createdSession.sessionID;
            } else {
                const rawResponse = await response.text();
                throw new Error(`Failed to create session. Raw Response: ${rawResponse}`);
            }
        } catch (error) {
            throw new Error(`Error creating session: ${error.message}`);
        }
    },

    deleteSession: async (sessionId) => {
        const deleteSessionUrl = `${SessionService.backendUrl}${sessionId}`;

        try {
            const response = await fetch(deleteSessionUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 404) {
                // Handle the "Not Found" scenario
                return null;
            }
            
            if (!response.ok && !response.status === 204) {
                const errorMessage = `Error deleting session: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error in SessionService.deleteSession:', error.message);
            throw error;
        }
    },

    fetchSession: async (sessionId) => {
        try {
            const response = await fetch(`${SessionService.backendUrl}${sessionId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 404) {

                console.log(`didnt found session with id ${sessionId}`);
                return null; // Session not found
            }

            if (response.ok) {
                const session = await response.json();
                console.log("found session response is ok");
                return session;
            } else {
                const errorMessage = `Failed to fetch session. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error fetching session: ${error.message}`);
        }
    },

    fetchUserSessions: async (userName) => {
        try {
            const lowercaseUserName = userName.toLowerCase();
            const response = await fetch(`${SessionService.backendUrl}all/${lowercaseUserName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 404) {
                return [];
            }

            if (response.ok) {
                const sessions = await response.json();
                return sessions;
            } else {
                const errorMessage = `Failed to fetch user sessions. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error fetching user sessions: ${error.message}`);
        }
    },

    
    joinSession: async (sessionId, userId) => {
        try {
            console.log(`user ${userId} want to join session ${sessionId}`);
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId }),
            });

            if (response.ok) {
                const result = await response.json();
                return result;
            } else if (response.status === 404) {
                throw new Error("Session not found");
            } else {
                const errorMessage = `Failed to join session. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error joining session: ${error.message}`);
        }
    },


    getSessionStudents: async (sessionId) => {
        try {
            console.log(`getSessionStudents`);
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/students`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            console.log(`responsestatus is : ${response.status}`);

            if (response.status === 404) {
                return []; // No students found
            }

            if (response.ok) {
                const students = await response.json();
                return students;
            } else {
                const errorMessage = `Failed to fetch session students. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error fetching session students: ${error.message}`);
        }
    },
};

export default SessionService;