using QuizBuzz.Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public interface ISessionService
    {
        Task<Session?> GetSessionByIdAsync(string sessionId);
        Task<string> CreateSessionAsync(Session newSession);
        Task DeleteSessionAsync(string sessionId);
        Task<IEnumerable<Session>> GetSessionsByHostUserIdAsync(string userId);

        Task<IEnumerable<string>> GetSessionParticipantsAsync(string sessionId);
    }
}
