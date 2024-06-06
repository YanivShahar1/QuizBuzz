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
        private readonly ILogger<SessionNotificationService> _logger;

        public SessionNotificationService(IHubContext<SessionHub> hubContext, ILogger<SessionNotificationService> logger)
        {
            _sessionHubContext = hubContext;
            _logger = logger;
        }

        public async Task NotifyNewQuestionIndex(string sessionId, int questionIndex)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("NextQuestion", questionIndex);
            _logger.LogInformation($"Sending NextQuestion notification for session: {sessionId}, Question Index: {questionIndex}");

        }

        public async Task NotifyUserJoined(string sessionId, string nickname)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("UserJoined", nickname);
            _logger.LogInformation($"Sending UserJoined notification for session: {sessionId}, Nickname: {nickname}");
        }

        public async Task NotifySessionFinished(string sessionId)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("SessionFinished");
            _logger.LogInformation($"Sending SessionFinished notification for session: {sessionId}");
        }

        public async Task NotifySessionStarted(string sessionId)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("SessionStarted");
            _logger.LogInformation($"Sending SessionStarted notification for session: {sessionId}");
        }

        public async Task NotifyAdminUserAnswered(string sessionId, string userNickname, int questionIndex, Response response)
        {
            var adminGroupName = $"{sessionId}_admin";
            await _sessionHubContext.Clients.Group(adminGroupName).SendAsync("UserAnswered", userNickname, questionIndex, response);
            _logger.LogInformation($"Sending UserAnswered notification for session: {sessionId}, User: {userNickname}, Question Index: {questionIndex}");

        }

        public async Task NotifySessionUpdated(string sessionId)
        {
            await _sessionHubContext.Clients.Group(sessionId).SendAsync("SessionUpdated");
            _logger.LogInformation($"Sending SessionUpdated notification for session: {sessionId}");
        }
    }
}
