using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Enums;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services;
using QuizBuzz.Backend.Services.Interfaces;
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

        private readonly QuizManager _quizManager;


        private readonly ICacheService<Quiz> _quizCache;
        private readonly IDynamoDBManager _dbManager;
        private readonly ILogger<QuizService> _logger;

        public QuizService(ICacheService<Quiz> quizCache, IDynamoDBManager dynamoDBManager, ILogger<QuizService> logger)
        {
            _quizCache = quizCache ?? throw new ArgumentNullException(nameof(quizCache));
            _dbManager = dynamoDBManager ?? throw new ArgumentNullException(nameof(dynamoDBManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _quizManager = new QuizManager();
        }

        public async Task<string> SubmitQuizAsync(Quiz newQuiz)
        {
            ArgumentNullException.ThrowIfNull(newQuiz);

            _quizManager.InitializeQuizWithId(newQuiz);
            await SaveQuizAsync(newQuiz);
            return newQuiz.QuizID;
        }

        public async Task SaveQuizAsync(Quiz updatedQuiz)
        {
            if (updatedQuiz == null)
            {
                throw new ArgumentNullException(nameof(updatedQuiz), "Updated quiz cannot be null");
            }
            // Save updated session in cache
            await _dbManager.SaveItemAsync(updatedQuiz);
            _quizCache.CacheItem(updatedQuiz.QuizID, updatedQuiz);
            _logger.LogInformation($"Saved quiz {updatedQuiz.QuizID} in DynamoDB database");

        }

        public List<string> GetCategories()
        {
            return Enum.GetValues(typeof(eQuizCategory))
              .Cast<eQuizCategory>()
              .Select(category => category.GetDescription())
              .ToList();
        }




        public async Task<Quiz> FetchQuizAsync(string quizId)
        {
            if (string.IsNullOrEmpty(quizId))
            {
                throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
            }

            Debug.WriteLine($"Fetching quiz with ID: {quizId}");

            Quiz? cachedQuiz = _quizCache.GetItem(quizId);

            if (cachedQuiz != null)
            {
                _logger.LogInformation($"Quiz with ID {quizId} found in cache.");
                return cachedQuiz!;
            }
            _logger.LogInformation($"Quiz with ID {quizId} not found in cache. Fetching from database.");

            // If not found in cache, fetch it from the database
            Quiz quiz = await _dbManager.GetItemAsync<Quiz>(quizId);
            if (quiz == null)
            {
                throw new KeyNotFoundException($"Quiz with ID {quizId} not found in database.");
            }

            _quizCache.CacheItem(quiz.QuizID, quiz);

            _logger.LogInformation($"Quiz with ID {quizId} fetched from database and cached.");
            // Remove correct answers before sending the quiz
            _logger.LogInformation($"sending quiz : {JsonConvert.SerializeObject(quiz)}");
            return quiz;
        }

        public void RemoveCorrectAnswers(Quiz quiz)
        {
            // Remove correct answers from quiz structure 
            foreach (var question in quiz.Questions)
            {
                question.CorrectOptions.Clear();
            }
        }

        public async Task DeleteQuizAsync(string quizId)
        {
            if (string.IsNullOrEmpty(quizId))
            {
                throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
            }

            Debug.WriteLine($"Deleting quiz with ID: {quizId}");

            await _dbManager.DeleteItemAsync<Quiz>(quizId);
            _quizCache.RemoveItem(quizId);
            _logger.LogInformation($"Quiz with ID {quizId} deleted from database. Cache invalidated.");
        }

        public async Task<IEnumerable<Quiz>> GetQuizzesByHostUserIdAsync(string hostUserId)
        {
            if (string.IsNullOrEmpty(hostUserId))
            {
                throw new ArgumentException("Host user ID cannot be null or empty.", nameof(hostUserId));
            }

            Debug.WriteLine($"Quiz service -> Getting quizzes for host user with ID: {hostUserId}");

            //return await _dynamoDBDataManager.QueryItemsAsync<Quiz>(HostUserIDIndexName, filterConditions);
            return await _dbManager.QueryItemsByIndexAsync<Quiz>(HostUserIDIndexName, HostUserIDAttributeName, hostUserId);
        }

        public async Task<IEnumerable<Question>> GetQuestionsAsync(string quizId)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(quizId))
                {
                    throw new ArgumentException("Quiz ID cannot be null or empty.", nameof(quizId));
                }

                Quiz? quiz = await FetchQuizAsync(quizId);

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

        public bool SuggestCategory(string category)
        {
            try
            {
                // TODO add logic here to handle the category suggestion, such as saving it to a database or processing it in some way.
                _logger.LogInformation($"Received category suggestion: {category}");

                // Return true to indicate that the suggestion was successfully received.
                return true;
            }
            catch (Exception ex)
            {
                // Log any errors that occur during the suggestion process.
                _logger.LogError(ex, $"Error suggesting category: {ex.Message}");

                // Return false to indicate that the suggestion failed.
                return false;
            }
        }

    }
}
