using Microsoft.AspNetCore.SignalR;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    public class SessionHub : Hub, ISessionHub
    {
        public async Task SendSessionCreatedNotification(string sessionId, string username)
        {
            try
            {
                Debug.WriteLine("in SendSessionCreatedNotification ");
                await Clients.All.SendAsync("SessionCreated", sessionId, username);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while sending SessionCreated notification: {ex.Message}");
            }
        }

        public async Task SendSessionUpdatedNotification(string sessionId, string username)
        {
            try
            {
                Debug.WriteLine("in SendSessionUpdatedNotification ");

                await Clients.All.SendAsync("SessionUpdated", sessionId, username);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while sending SessionUpdated notification: {ex.Message}");
            }
        }

        public async Task SendSessionDeletedNotification(string sessionId, string username)
        {
            try
            {
                Debug.WriteLine("in SendSessionDeletedNotification ");

                await Clients.All.SendAsync("SessionDeleted", sessionId, username);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while sending SessionDeleted notification: {ex.Message}");
            }
        }

        public async Task SendUserJoinedNotification(string sessionId, string userId)
        {
            try
            {
                Debug.WriteLine($"Sending user joined notification for session {sessionId}, user {userId}");
                await Clients.All.SendAsync("UserJoined", sessionId, userId);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while sending user joined notification: {ex.Message}");
            }
        }

    }
}
