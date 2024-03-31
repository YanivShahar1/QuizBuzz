using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
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
            Debug.WriteLine($"Saving quiz: {newQuiz}");

            newQuiz.QuizID = Guid.NewGuid().ToString(); // Generate a unique ID for the quiz
            Debug.WriteLine($"Generated QuizID: {newQuiz.QuizID}");

            // Additional validation or business logic if needed
            await _dynamoDBDataManager.SaveItemAsync(newQuiz);
            Debug.WriteLine($"Saved {newQuiz.QuizID} in DynamoDB database");

            // Invalidate the cache to reflect the new data
            Debug.WriteLine($"Removed AllQuizzes from cache");
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

            Debug.WriteLine($"Fetching quiz with ID: {quizId}");

            // Check if the quiz exists in the cache
            string cacheKey = $"Quiz_{quizId}";
            if (_cache.TryGetValue(cacheKey, out Quiz? cachedQuiz))
            {
                Debug.WriteLine($"Quiz with ID {quizId} found in cache.");

                _logger.LogInformation($"Quiz with ID {quizId} found in cache.");
                return cachedQuiz!;
            }
            _logger.LogInformation($"Quiz with ID {quizId} not found in cache. Fetching from database.");
            Debug.WriteLine($"Quiz with ID {quizId} not found in cache. Fetching from database.");

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
            else
            {
                _logger.LogInformation($"Quiz with ID {quizId} not found in database.");
            }

            return quiz;
        }

        public async Task DeleteQuizAsync(string quizId)
        {
            if (string.IsNullOrEmpty(quizId))
            {
                throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
            }

            Debug.WriteLine($"Deleting quiz with ID: {quizId}");

            await _dynamoDBDataManager.DeleteItemAsync<Quiz>(quizId);

            // Invalidate the cache after deletion
            _cache.Remove("AllQuizzes");
            _cache.Remove($"Quiz_{quizId}");
            Debug.WriteLine($"removed AllQuizzes and : Quiz_{quizId} from cache");

            _logger.LogInformation($"Quiz with ID {quizId} deleted from database. Cache invalidated.");
        }

        public async Task<IEnumerable<Quiz>> GetQuizzesByHostUserIdAsync(string hostUserId)
        {
            if (string.IsNullOrEmpty(hostUserId))
            {
                throw new ArgumentException("Host user ID cannot be null or empty.", nameof(hostUserId));
            }

            Debug.WriteLine($"Quiz service -> Getting quizzes for host user with ID: {hostUserId}");

            var filterConditions = new Dictionary<string, string>
                                    {
                                        { HostUserIDAttributeName, hostUserId }
                                    };

            //return await _dynamoDBDataManager.QueryItemsAsync<Quiz>(HostUserIDIndexName, filterConditions);
            return await _dynamoDBDataManager.QueryItemsByIndexAsync<Quiz>(HostUserIDIndexName, HostUserIDAttributeName, hostUserId);
        }

        public async Task<IEnumerable<Question>> GetQuestionsAsync(string quizId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(quizId))
                {
                    throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
                }

                Quiz? quiz = await GetQuizAsync(quizId);

                return quiz?.Questions ?? Enumerable.Empty<Question>();
            }
            catch (Exception ex)
            {
                // Log the error
                _logger.LogError(ex, $"Error fetching questions for quiz with ID {quizId}: {ex.Message}");

                // Optionally, rethrow the exception or handle it based on the application's error handling strategy
                throw;
            }
        }

    }
}
