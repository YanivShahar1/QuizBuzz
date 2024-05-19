using QuizBuzz.Backend.Models;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public interface ISessionNotificationService
    {
        Task NotifySessionUpdated(string sessionId);
        Task NotifyUserJoined(string sessionId, string nickname);
        Task NotifySessionStarted(string sessionId);
        Task NotifySessionFinished(string sessionId);
        Task NotifyNewQuestionIndex(string sessionId, int questionIndex);
        Task NotifyAdminUserAnswered(string sessionId, string nickname,int questionIndex, Response response);
    }
}
