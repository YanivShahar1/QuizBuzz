using Microsoft.Extensions.Caching.Memory;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services.Interfaces;

namespace QuizBuzz.Backend.Services
{
    public class SessionCacheService : ICacheService<Session>
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<SessionCacheService> _logger;

        public SessionCacheService(IMemoryCache cache, ILogger<SessionCacheService> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public Session? GetItem(string sessionId)
        {
            validateSessionId(sessionId);

            string cacheKey = $"Session_{sessionId}";
            if (_cache.TryGetValue(cacheKey, out Session? cachedSession))
            {
                _logger.LogInformation($"Session with ID {sessionId} found in cache.");
                return cachedSession;
            }

            _logger.LogInformation($"Session with ID {sessionId} not found in cache.");
            return null;
        }


        public void CacheItem(string sessionId, Session session)
        {
            string cacheKey = $"Session_{sessionId}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                Priority = CacheItemPriority.High
            };
            _cache.Set(cacheKey, session, cacheOptions);

            _logger.LogInformation($"Session with ID {sessionId} cached successfully.");
        }

        public void RemoveItemAsync(string sessionId)
        {
            string cacheKey = $"Session_{sessionId}";
            _cache.Remove(cacheKey);

            _logger.LogInformation($"Session with ID {sessionId} removed from cache.");
        }

        public SessionResult? GetSessionResult(string sessionId)
        {
            validateSessionId(sessionId);

            string cacheKey = $"Result_{sessionId}";
            if (_cache.TryGetValue(cacheKey, out SessionResult? cachedResult))
            {
                _logger.LogInformation($"Session result with ID {sessionId} found in cache.");
                return cachedResult;
            }

            _logger.LogInformation($"Session result with ID {sessionId} not found in cache.");
            return null;
        }

        public void CacheSessionResult(string sessionId, SessionResult sessionResult)
        {
            validateSessionId(sessionId);

            string cacheKey = $"Result_{sessionId}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                Priority = CacheItemPriority.High
            };
            _cache.Set(cacheKey, sessionResult, cacheOptions);

            _logger.LogInformation($"Session result with ID {sessionId} cached successfully.");
        }



        public UserResponses? GetUserResponses(string sessionId, string userNickname)
        {
            validateSessionId(sessionId);

            if (string.IsNullOrEmpty(userNickname))
            {
                throw new ArgumentException("Participant name cannot be null or empty.", nameof(userNickname));
            }

            string cacheKey = $"SessionUserResponses_{sessionId}_{userNickname}";
            if (_cache.TryGetValue(cacheKey, out UserResponses? cachedResponses))
            {
                _logger.LogInformation($"Session user responses for participant {userNickname} in session with ID {sessionId} found in cache.");
                return cachedResponses;
            }

            _logger.LogInformation($"Session user responses for participant {userNickname} in session with ID {sessionId} not found in cache.");
            return null;
        }

        public void CacheUserResponses(string sessionId, string participant, UserResponses userResponses)
        {
            validateSessionId(sessionId);

            if (string.IsNullOrEmpty(participant))
            {
                throw new ArgumentException("Participant cannot be null or empty.", nameof(participant));
            }

            string cacheKey = $"SessionUserResponses_{sessionId}_{participant}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                Priority = CacheItemPriority.High
            };
            _cache.Set(cacheKey, userResponses, cacheOptions);

            _logger.LogInformation($"Session user responses for participant {participant} in session with ID {sessionId} cached successfully.");
        }

        public IEnumerable<string>? GetUserSessionIds(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            string cacheKey = $"UserSessions_{userId}";
            if (_cache.TryGetValue(cacheKey, out IEnumerable<string>? sessionIds))
            {
                _logger.LogInformation($"Session IDs for user with ID {userId} found in cache.");
                return sessionIds;
            }

            _logger.LogInformation($"Session IDs for user with ID {userId} not found in cache.");
            return null;
        }

        public void CacheUserSessionIds(string userId, IEnumerable<string> sessionIds)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            string cacheKey = $"UserSessions_{userId}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                Priority = CacheItemPriority.High
            };
            _cache.Set(cacheKey, sessionIds, cacheOptions);

            _logger.LogInformation($"Session IDs for user with ID {userId} cached successfully.");
        }
        private void validateSessionId(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }
        }
    }
}
