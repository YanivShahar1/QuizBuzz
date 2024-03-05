using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    public interface ISessionHub
    {
        Task SendSessionCreatedNotification(string sessionId, string username);

        Task SendSessionUpdatedNotification(string sessionId, string username);

        Task SendSessionDeletedNotification(string sessionId, string username);

        Task UserJoined(string sessionId, string userId);
    }
}
