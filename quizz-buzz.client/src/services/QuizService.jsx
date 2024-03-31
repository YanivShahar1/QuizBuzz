
const QuizService = {
    backendUrl : "https://localhost:7141/api/quiz/",
    submitQuiz: async (quizData) => {
        try {
            console.log(`in submit quiz`);
            const response = await fetch(QuizService.backendUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizData),
            });

            if (response.ok) {
                const createdQuiz = await response.json();

                console.log("createdQuiz: ", createdQuiz.quizID)
                return createdQuiz.quizID;
            } else {

                const rawResponse = await response.text();
                throw new Error(`Failed to submit quiz. Raw Response: ${rawResponse}`);
            }
        } catch (error) {
            throw new Error(`Error submitting quiz: ${error.message}`);
        }
    },

    deleteQuiz: async (quizId) => {
        const deleteQuizUrl = `${QuizService.backendUrl}${quizId}`;

        try {
            const response = await fetch(deleteQuizUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 404) {
                // Handle the "Not Found" scenario
                return null;
            }
            
            //204 - NoContent-> successfull delete
            if (!response.ok && !response.status === 204) {
                const errorMessage = `Error  delete quiz details: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            // Log or handle the error as needed
            console.error('Error in QuizService.delete:', error.message);
            throw error;
        }
    },

    fetchQuiz: async (quizId) => {
        const fetchQuizUrl = `${QuizService.backendUrl}${quizId}`;

        try {
            const response = await fetch(fetchQuizUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 404) {
                // Handle the "Not Found" scenario
                return null;
            }

            if (!response.ok) {
                const errorMessage = `Error fetching quiz details: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            // Log or handle the error as needed
            console.error('Error in QuizService.fetchQuiz:', error.message);
            throw error;
        }
    },

    fetchCategories: async () => {
        const fetchCategoriesUrl = `${QuizService.backendUrl}categories`;

        try {
            const response = await fetch(fetchCategoriesUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 404) {
                // Handle the "Not Found" scenario
                return null;
            }

            if (!response.ok) {
                const errorMessage = `Error fetching categories, details: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const categories = await response.json();
            console.log(`categories: ${categories}`);
            return categories;
        } catch (error) {
            // Log or handle the error as needed
            console.error('Error in QuizService.fetchQuiz:', error.message);
            throw error;
        }
    },



    fetchUserQuizzes: async (userName) => {
        try {
            // Validate userName
            if (!userName || typeof userName !== 'string') {
                throw new Error('Invalid username');
            }
            // Convert username to lowercase because Cognito saves all users with lowercase
            const lowercaseUserName = userName.toLowerCase();
            const response = await fetch(`${QuizService.backendUrl}all/${lowercaseUserName}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.status === 404) {
                // If the user's quizzes are not found, return an empty array or null
                return []; // You can also return null if appropriate
            }

            if (response.ok) {
                const quizzes = await response.json();
                return quizzes;
            } else {
                const errorMessage = `Failed to fetch user quizzes. Status: ${response.status}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error fetching user quizzes: ${error.message}`);
        }
    },
};

export default QuizService;
