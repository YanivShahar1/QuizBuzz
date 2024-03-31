using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public interface ISessionNotificationService
    {
        Task NotifySessionUpdated(string sessionId);
        Task NotifyQuestionResponseSubmitted(string sessionId, string nickname, int questionIndex, bool isCorrect);
    }
}
