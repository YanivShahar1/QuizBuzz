using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    public class SessionHub : Hub
    {
        public async Task SendSessionCreatedNotification(string sessionId, string username)
        {
            try
            {
                await Clients.All.SendAsync("SessionCreated", sessionId, username);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while sending SessionCreated notification: {ex.Message}");
            }
        }

        public async Task SendSessionUpdatedNotification(string sessionId, string username)
        {
            try
            {
                await Clients.All.SendAsync("SessionUpdated", sessionId, username);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while sending SessionUpdated notification: {ex.Message}");
            }
        }

        public async Task SendSessionDeletedNotification(string sessionId, string username)
        {
            try
            {
                await Clients.All.SendAsync("SessionDeleted", sessionId, username);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"An error occurred while sending SessionDeleted notification: {ex.Message}");
            }
        }
    }
}
