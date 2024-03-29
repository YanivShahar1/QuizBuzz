﻿using QuizBuzz.Backend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public interface ISessionService
    {
        Task<Session?> GetSessionByIdAsync(string sessionId);
        Task<string> CreateSessionAsync(Session newSession);
        Task DeleteSessionAsync(string sessionId);

        Task UpdateSessionAsync(Session updatedSession);

        Task<IEnumerable<string>> GetSessionParticipantsAsync(string sessionId);

        Task AddUserToSessionAsync(string sessionId, string userId);
        Task<IEnumerable<Session>> GetSessionsByUserIdAsync(string userId);

        Task SaveQuestionResponseAsync(string sessionId, SessionUserResponses userResponse);

    }
}
