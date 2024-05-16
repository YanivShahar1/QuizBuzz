using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using System.Threading.Tasks;
using QuizBuzz.Backend.Hubs;

namespace QuizBuzz.Backend.Services
{
    public class SessionNotificationService : ISessionNotificationService
    {
        private readonly IHubContext<SessionHub> _hubContext;

        public SessionNotificationService(IHubContext<SessionHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task NotifyQuestionResponseSubmitted(string sessionId, string nickname, int questionIndex, bool isCorrect)
        {
            await _hubContext.Clients.Group(sessionId).SendAsync("QuestionResponseSubmitted", nickname, questionIndex, isCorrect);
            Debug.WriteLine("Sent QuestionResponseSubmitted!");
        }

        public async Task NotifySessionUpdated(string sessionId)
        {
            await _hubContext.Clients.Group(sessionId).SendAsync("SessionUpdated");
            Debug.WriteLine($"Sent SessionUpdated notification for session: {sessionId}");
        }
    }
}
