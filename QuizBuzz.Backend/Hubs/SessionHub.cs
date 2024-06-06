using Microsoft.AspNetCore.SignalR;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    public class SessionHub : Hub
    {

        private readonly ISessionService _sessionService;
        private readonly ILogger<SessionHub> _logger;

        public SessionHub(ISessionService sessionService, ILogger<SessionHub> logger)
        {
            _sessionService = sessionService;
            _logger = logger;
        }

        public async Task JoinSessionGroup(string sessionId)
        {
            // Add the connection to the SignalR group associated with the session
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            _logger.LogInformation($"Connection {Context.ConnectionId} joined session group {sessionId}");
        }

        public async Task JoinAdminGroup(string sessionId, string userName)
        {
            try
            {
                if (await _sessionService.ValidateSessionAdmin(sessionId, userName))
                {
                    _logger.LogInformation($"{userName} is admin");
                    var adminGroupName = $"{sessionId}_admin";
                    await Groups.AddToGroupAsync(Context.ConnectionId, adminGroupName);
                }
                else
                {
                    _logger.LogInformation($"{userName} is NOT admin");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while adding {userName} to admin group for session {sessionId}: {ex.Message}");
            }
        }


        public async Task LeaveAdminGroup(string sessionId, string userName)
        {
            try
            {
                if (await _sessionService.ValidateSessionAdmin(sessionId, userName))
                {
                    _logger.LogInformation($"{userName} is admin");
                    var adminGroupName = $"{sessionId}_admin";
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, adminGroupName);
                }
                else
                {
                    _logger.LogInformation($"{userName} is NOT admin");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while removing {userName} from admin group for session {sessionId}: {ex.Message}");
            }
        }


        public async Task SessionFinished(string sessionId)
        {
            try
            {
                // Update session end time using the session service
                await _sessionService.FinishSessionAsync(sessionId);
                _logger.LogInformation($"Session finished: {sessionId}");
            }
            catch (Exception ex)
            {
                _logger.LogError($"An error occurred while ending quiz: {ex.Message}");
            }
        } 
    }
}
