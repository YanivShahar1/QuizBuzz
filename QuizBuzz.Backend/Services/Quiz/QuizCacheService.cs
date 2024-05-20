using Microsoft.Extensions.Caching.Memory;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services.Interfaces;

namespace QuizBuzz.Backend.Services
{
    public class QuizCacheService : ICacheService<Quiz>
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<QuizCacheService> _logger;

        public QuizCacheService(IMemoryCache cache, ILogger<QuizCacheService> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public Quiz? GetItem(string quizId)
        {
            validateQuizId(quizId);

            string cacheKey = $"Quiz_{quizId}";
            if (_cache.TryGetValue(cacheKey, out Quiz? cachedQuiz))
            {
                _logger.LogInformation($"Quiz with ID {quizId} found in cache.");
                return cachedQuiz;
            }

            _logger.LogInformation($"Quiz with ID {quizId} not found in cache.");
            return null;
        }

        public void CacheItem(string quizId, Quiz quiz)
        {
            string cacheKey = $"Quiz_{quizId}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                Priority = CacheItemPriority.High
            };
            _cache.Set(cacheKey, quiz, cacheOptions);

            _logger.LogInformation($"Quiz with ID {quizId} cached successfully.");
        }

        public void RemoveItem(string quizId)
        {
            string cacheKey = $"Quiz_{quizId}";
            _cache.Remove(cacheKey);

            _logger.LogInformation($"Quiz with ID {quizId} removed from cache.");
        }

      
        public IEnumerable<string>? GetUserQuizIds(string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            string cacheKey = $"UserQuizzes_{userId}";
            if (_cache.TryGetValue(cacheKey, out IEnumerable<string>? quizIds))
            {
                _logger.LogInformation($"Quiz IDs for user with ID {userId} found in cache.");
                return quizIds;
            }

            _logger.LogInformation($"Quiz IDs for user with ID {userId} not found in cache.");
            return null;
        }

        public void CacheUserQuizIds(string userId, IEnumerable<string> quizIds)
        {
            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            string cacheKey = $"UserQuizzes_{userId}";
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                Priority = CacheItemPriority.High
            };
            _cache.Set(cacheKey, quizIds, cacheOptions);

            _logger.LogInformation($"Quiz IDs for user with ID {userId} cached successfully.");
        }

        private void validateQuizId(string quizId)
        {
            if (string.IsNullOrEmpty(quizId))
            {
                throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
            }
        }
    }
}
