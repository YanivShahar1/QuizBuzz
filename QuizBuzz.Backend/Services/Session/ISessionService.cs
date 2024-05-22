using QuizBuzz.Backend.DTOs;
using QuizBuzz.Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public interface ISessionService
    {
        Task<Session> FetchSessionAsync(string sessionId);
        Task<string> SubmitSessionAsync(Session newSession);
        Task DeleteSessionAsync(string sessionId);

        Task SaveSessionAsync(Session updatedSession);

        Task<IEnumerable<string>> GetSessionParticipantsAsync(string sessionId);

        Task JoinSession(string sessionId, string userId);
        Task<IEnumerable<Session>> GetSessionsByHostId(string userId);

        Task<bool> SubmitUserAnswerAsync(AnswerSubmissionDto answerSubmission);

        Task<SessionResult> FetchSessionResultsAsync(string sessionId);
        Task FinishSessionAsync(string sessionId);

        Task<IEnumerable<UserResponses>> GetSessionResponsesAsync(string sessionId);

        Task StartSession(string sessionId);
        Task<bool> ValidateSessionAdmin(string sessionid, string userName);



    }
}
