using QuizBuzz.Backend.Models;

namespace QuizBuzz.Backend.Services
{
    public interface IQuizService
    {
        Task<Quiz?> GetQuizAsync(string quizId);
        Task<String> SaveQuizAsync(Quiz newQuiz);
        Task DeleteQuizAsync(string quizId);

        Task<IEnumerable<Quiz>> GetQuizzesByHostUserIdAsync(string userId);

        Task<IEnumerable<Question>> GetQuestionsAsync(string quizId);
        // Add other methods as needed for your specific requirements
    }
}
