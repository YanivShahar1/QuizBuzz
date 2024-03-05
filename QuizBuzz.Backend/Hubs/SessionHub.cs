using Microsoft.AspNetCore.SignalR;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    public class SessionHub : Hub
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

        public async Task UserJoined(string sessionId, string userId)
        {
            Debug.WriteLine($"Adding user {userId} to session group {sessionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            Debug.WriteLine($"User {userId} added to session group {sessionId}");

            Debug.WriteLine($"Sending UserJoined message to session group {sessionId}");
            await Clients.Group(sessionId).SendAsync("UserJoined", userId);
            //await Clients.All.SendAsync("UserJoined", userId);
            Debug.WriteLine($"UserJoined message sent to session group {sessionId}");

            Debug.WriteLine($"User {userId} joined session {sessionId} successfully");
        }


        [HubMethodName("SessionStarted")]
        public async Task SessionStarted(string sessionId)
        {
            try
            {
                Debug.WriteLine($"Sessionhub , session {sessionId} has started");

                // Send the event to clients in the session group
                await Clients.Group(sessionId).SendAsync("SessionStarted", sessionId);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while sending SessionStarted notification: {ex.Message}");
            }
        }
    }
}
