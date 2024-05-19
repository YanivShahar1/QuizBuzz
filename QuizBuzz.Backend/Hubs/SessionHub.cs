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

        public SessionHub(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        public async Task JoinSessionGroup(string sessionId)
        {
            // Add the connection to the SignalR group associated with the session
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            // Optionally, you can log or perform any other necessary actions here
        }

        public async Task JoinAdminGroup(string sessionId, string userName)
        {
            try
            {
                if (await _sessionService.ValidateSessionAdmin(sessionId, userName))
                {
                    Debug.WriteLine($"{userName} is admin");
                    var adminGroupName = $"{sessionId}_admin";
                    await Groups.AddToGroupAsync(Context.ConnectionId, adminGroupName);
                }
                else
                {
                    Debug.WriteLine($"{userName} is NOT admin");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while adding {userName} to admin group for session {sessionId}: {ex.Message}");
                // Optionally, log the exception using a logging framework
                // Logger.LogError(ex, $"An error occurred while adding {userName} to admin group for session {sessionId}");
            }
        }


        public async Task LeaveAdminGroup(string sessionId, string userName)
        {
            try
            {
                if (await _sessionService.ValidateSessionAdmin(sessionId, userName))
                {
                    Debug.WriteLine($"{userName} is admin");
                    var adminGroupName = $"{sessionId}_admin";
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, adminGroupName);
                }
                else
                {
                    Debug.WriteLine($"{userName} is NOT admin");
                }
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while removing {userName} from admin group for session {sessionId}: {ex.Message}");
            }
        }


        public async Task SessionFinished(string sessionId)
        {
            try
            {
                // Update session end time using the session service
                await _sessionService.FinishSessionAsync(sessionId);
                Debug.WriteLine($"Session finished: {sessionId}");  
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while ending quiz: {ex.Message}");
            }
        } 
    }
}
