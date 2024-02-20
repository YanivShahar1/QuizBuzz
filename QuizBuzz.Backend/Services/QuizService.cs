using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Models;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public class QuizService : IQuizService
    {
        private const string HostUserIDIndexName = "HostUserID-index";
        private const string HostUserIDAttributeName = "HostUserID";

        private readonly IMemoryCache _cache;
        private readonly IDynamoDBDataManager _dynamoDBDataManager;
        private readonly ILogger<QuizService> _logger;

        public QuizService(IMemoryCache cache, IDynamoDBDataManager dynamoDBDataManager, ILogger<QuizService> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _dynamoDBDataManager = dynamoDBDataManager ?? throw new ArgumentNullException(nameof(dynamoDBDataManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string> SaveQuizAsync(Quiz newQuiz)
        {
            ArgumentNullException.ThrowIfNull(newQuiz);

            newQuiz.QuizID = Guid.NewGuid().ToString(); // Generate a unique ID for the quiz

            // Additional validation or business logic if needed
            await _dynamoDBDataManager.SaveItemAsync(newQuiz);

            // Invalidate the cache to reflect the new data
            _cache.Remove("AllQuizzes");

            _logger.LogInformation("New quiz saved to database. Cache invalidated.");

            return newQuiz.QuizID;
        }

        public async Task<Quiz?> GetQuizAsync(string quizId)
        {
            if (string.IsNullOrEmpty(quizId))
            {
                throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
            }

            // Check if the quiz exists in the cache
            string cacheKey = $"Quiz_{quizId}";
            if (_cache.TryGetValue(cacheKey, out Quiz? cachedQuiz))
            {
                _logger.LogInformation($"Quiz with ID {quizId} found in cache.");
                return cachedQuiz!;
            }

            _logger.LogInformation($"Quiz with ID {quizId} not found in cache. Fetching from database.");

            // If not found in cache, fetch it from the database
            Quiz quiz = await _dynamoDBDataManager.GetItemAsync<Quiz>(quizId);

            // Cache the fetched quiz
            if (quiz != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                    Priority = CacheItemPriority.High
                };
                _cache.Set(cacheKey, quiz, cacheOptions);

                _logger.LogInformation($"Quiz with ID {quizId} fetched from database and cached.");
            }

            return quiz;
        }

        public async Task DeleteQuizAsync(string quizId)
        {
            if (string.IsNullOrEmpty(quizId))
            {
                throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
            }

            await _dynamoDBDataManager.DeleteItemAsync<Quiz>(quizId);

            // Invalidate the cache after deletion
            _cache.Remove("AllQuizzes");
            _cache.Remove($"Quiz_{quizId}");

            _logger.LogInformation($"Quiz with ID {quizId} deleted from database. Cache invalidated.");
        }

        public async Task<IEnumerable<Quiz>> GetQuizzesByHostUserIdAsync(string hostUserId)
        {
            return await _dynamoDBDataManager.QueryItemsByIndexAsync<Quiz>(HostUserIDIndexName, HostUserIDAttributeName, hostUserId);
        }
    }
}
