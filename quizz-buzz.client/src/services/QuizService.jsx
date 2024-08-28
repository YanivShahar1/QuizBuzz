import { API_BACKEND_URL } from "../utils/constants";

const QuizService = {
    // backendUrl : "https://localhost:7141/api/quiz/",
    backendUrl : `${API_BACKEND_URL}/quiz/`,
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

    suggestCategory: async (category) => {
        
        try {
            const suggestCategoryUrl = `${QuizService.backendUrl}category`;
            console.log(`suggesting category : ${category}`);
            const response = await fetch(suggestCategoryUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ category }),
            });

            console.log(`response = ${JSON.stringify(response)}`);
            if (response.ok) {
                const responseData = await response.json();
                return responseData;
            } else {
                const errorMessage = `Failed to suggest category. Status: ${response.status}, Details: ${response.statusText}`;
                throw new Error(errorMessage);
            }
        } catch (error) {
            throw new Error(`Error suggesting category: ${error.message}`);
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
            console.log(response.status);
            //204 - NoContent-> successfull delete
            if (!response.ok && !response.status === 204) {
                console.log("1");
                const errorMessage = `Error  delete quiz details: ${response.statusText}`;
                throw new Error(errorMessage);
            }

        } catch (error) {
            // Log or handle the error as needed
            console.error('Error in QuizService.delete:', error.message);
            throw error;
        }
    },

    deleteQuizzes: async (quizIds) => {
        try {
            console.log(`want to delete quizzes : ${quizIds.join(', ')}`);
            const response = await fetch(`${QuizService.backendUrl}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(quizIds),
            });
    
            if (response.status === 404) {
                // Handle the "Not Found" scenario
                return null;
            }
            
            if (!response.ok && !response.status === 204) {
                const errorMessage = `Error deleting Quizzes: ${response.statusText}`;
                throw new Error(errorMessage);
            }
    
        } catch (error) {
            console.error('Error in QuizService.deleteQuizzes:', error.message);
            throw error;
        }
    },
    
    FetchAllQuizzes: async () => {
        const fetchQuizzesUrl = `${QuizService.backendUrl}all`;
        try {
            const response = await fetch(fetchQuizzesUrl, {
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
                const errorMessage = `Error fetching all quizzes, statusText: ${response.statusText}`;
                throw new Error(errorMessage);
            }

            const data = await response.json();
            return data;
        } catch (error) {
            // Log or handle the error as needed
            console.error('Error while fetching all quizzes:', error.message);
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
    
            if (!response.ok) {
                const errorMessage = `Error fetching categories, status: ${response.status}, details: ${response.statusText}`;
                throw new Error(errorMessage);
            }
    
            const categories = await response.json();
            console.log(`categories: ${JSON.stringify(categories)}`);
            return categories;
        } catch (error) {
            // Log or handle the error as needed
            console.error('Error in QuizService.fetchCategories:', error.message);
            throw error;
        }
    },

    FetchUserQuizzes: async (userName) => {
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
