import AuthService from "./AuthService";


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
                const sessionId = await response.text();
                return sessionId;
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

        } catch (error) {
            console.error('Error in SessionService.deleteSession:', error.message);
            throw error;
        }
    },

    duplicateSession: async (sessionId) => {
        try {
            console.log(`Duplicating session with ID: ${sessionId}`);
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/duplicate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                console.log(`Session duplicated successfully.`);
                const result = await response.text();
                console.log(`result = . ${result}`);
                return result;
            } else if (response.status === 404) {
                console.log(`Session with ID ${sessionId} not found.`);
                throw new Error("Session not found");
            } else {
                const errorMessage = `Failed to duplicate session. Status: ${response.status}`;
                console.error(errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error(`Error duplicating session: ${error.message}`);
            throw new Error(`Error duplicating session: ${error.message}`);
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

    fetchResponses: async (sessionId) => {
        try {
            console.log("sssion id in fetchresponses: .. ", sessionId);
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/responses`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 404) {
                console.log(`Responses not found for session with ID ${sessionId}`);
                return []; // Responses not found
            }
    
            if (response.ok) {
                const responses = await response.json();
                console.log(`Responses found for session with ID ${sessionId}:`, responses);
                return responses;
            } else {
                const errorMessage = `Failed to fetch responses. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error fetching responses: ${error.message}`);
        }
    },
    

    
    joinSession: async (sessionId, nickname) => {
        try {
            console.log(`user ${nickname} want to join session ${sessionId}`);
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/join`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(nickname),
            });
            console.log(`finish feth from backend : response status is ${response.status}`);

            if (response.ok) {
                const result = await response.text();
                console.log(`result is : ${result}`);
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

    getParticipants: async (sessionId) => {
        try {
            console.log(`getParticipants`);
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/participants`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log(`responsestatus is : ${response.status}`);

            if (response.status === 404) {
                console.log("no students found !");
                return []; // No students found
            }

            if (response.ok) {
                const students = await response.json();
                console.log(`students found : ${students}`);

                return students;
            } else {
                const errorMessage = `Failed to fetch session students. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error fetching session students: ${error.message}`);
        }
    },

    isSessionStarted: (session) => {
        if (!session) {
            console.log("Session is null");
            return false;
        }
        const res = new Date(session.startedAt) < new Date();
        console.log(`session id ${session.sessionID} ${res ? "started" : "not started yet"}`);
        return res;
    },
    
    isSessionFinished: (session) => {
        if (!session) {
            console.log("Session is null");
            return false;
        }
        console.log(`session.endedAt = ${session.endedAt}`);
        const res = new Date(session.endedAt) < new Date();
        console.log(`session id ${session.sessionID} ${res ? "finished" : "didnt finished yet"}`);
        return res;
    },



    startSession: async (sessionId) => {
        try {
            console.log(`session service-> startSession, session id: ${sessionId}`);
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/start`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                console.log(`Session ${sessionId} started successfully.`);
            } else if (response.status === 404) {
                throw new Error("Session not found");
            } else if (response.status === 409) {
                throw new Error("Session has already started");
            } else {
                const errorMessage = `Failed to start session. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error starting session: ${error.message}`);
        }
    },
    
    submitAnswer: async (answer) => {
        try {
            console.log("submitAnswer, answer:", JSON.stringify(answer));
            const response = await fetch(`${SessionService.backendUrl}submit-answer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(answer),
            });
            if (!response.ok) {
                const errorMessage = await response.text();
                console.log(`error msg submitAnswer: ${errorMessage}`);
                throw new Error(`Failed to submit answer. Status: ${response.status} text : ${errorMessage}
                                \n error :${response.errorMessage}`);
            }
        } catch (error) {
            throw new Error(`Error submitting answer:msg: ${error.message} errormsg: ${error.errorMessage}`);
        }
    },

    fetchSessionResults: async (sessionId) => {
        try {
            const response = await fetch(`${SessionService.backendUrl}${sessionId}/results`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.status === 404) {
                console.log("not found results")
                return []; // not found
            }
    
            if (response.ok) {
                const sessionResults = await response.json();
                return sessionResults;
            } else {
                const errorMessage = `Failed to fetch sessionResults data. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error fetching sessionResults data: ${error.message}`);
        }
    },
    

};

export default SessionService;