// LeaderboardHub.cs
using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    public class LeaderboardHub : Hub
    {
        public async Task SendScoreUpdate(string userId, int newScore)
        {
            await Clients.All.SendAsync("ScoreUpdated", userId, newScore);
        }
    }

}
