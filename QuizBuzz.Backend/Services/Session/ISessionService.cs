using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Models.DTO;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public interface ISessionService
    {
        Task<Session?> GetSessionAsync(string sessionId);
        Task<string> SaveSessionAsync(Session newSession);
        Task DeleteSessionAsync(string sessionId);

        Task UpdateSessionAsync(Session updatedSession);

        Task<IEnumerable<string>> GetSessionParticipantsAsync(string sessionId);

        Task AddUserToSessionAsync(string sessionId, string userId);
        Task<IEnumerable<Session>> GetUserSessions(string userId);

        Task<bool> UpdateUserResponsesAsync(AnswerSubmissionDto answerSubmission);

        Task<SessionResult> GetSessionResultsAsync(string sessionId);
        Task FinishSessionAsync(string sessionId);

        Task<IEnumerable<UserResponses>> GetSessionResponsesAsync(string sessionId);


    }
}
