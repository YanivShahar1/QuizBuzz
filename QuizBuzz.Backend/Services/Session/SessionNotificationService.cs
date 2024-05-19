using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using System.Threading.Tasks;
using QuizBuzz.Backend.Hubs;
using QuizBuzz.Backend.Models;

namespace QuizBuzz.Backend.Services
{
    public class SessionNotificationService : ISessionNotificationService
    {
        private readonly IHubContext<SessionHub> _sessionHubContext;

        public SessionNotificationService(IHubContext<SessionHub> hubContext)
        {
            _sessionHubContext = hubContext;
        }

        public async Task NotifyNewQuestionIndex(string sessionId, int questionIndex)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("NextQuestion", questionIndex);
        }

        public async Task NotifyUserJoined(string sessionId, string nickname)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("UserJoined", nickname);
        }

        public async Task NotifySessionFinished(string sessionId)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("SessionFinished");

        }

        public async Task NotifySessionStarted(string sessionId)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("SessionStarted");

        }

        public async Task NotifyAdminUserAnswered(string sessionId, string userNickname, int questionIndex, Response response)
        {
            var adminGroupName = $"{sessionId}_admin";
            await _sessionHubContext.Clients.Group(adminGroupName).SendAsync("UserAnswered", userNickname, questionIndex, response);
        }

        public async Task NotifySessionUpdated(string sessionId)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("SessionUpdated");
            Debug.WriteLine($"Sent SessionUpdated notification for session: {sessionId}");
        }
    }
}
