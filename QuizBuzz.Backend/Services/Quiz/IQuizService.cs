using QuizBuzz.Backend.Models;

namespace QuizBuzz.Backend.Services
{
    public interface IQuizService
    {
        Task<Quiz> FetchQuizAsync(string quizId);
        Task<string> SubmitQuizAsync(Quiz newQuiz);
        Task DeleteQuizAsync(string quizId);

        List<string> GetCategories();

        Task<IEnumerable<Quiz>> GetQuizzesByHostUserIdAsync(string userId);

        Task<IEnumerable<Question>> GetQuestionsAsync(string quizId);

        bool SuggestCategory(string category);
    
    }
}
