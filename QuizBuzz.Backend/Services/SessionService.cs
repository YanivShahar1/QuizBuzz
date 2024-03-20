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
    public class SessionService : ISessionService
    {
        private const string HostUserIDIndexName = "HostUserID-index";
        private const string HostUserIDAttributeName = "HostUserID";

        private readonly IMemoryCache _cache;
        private readonly IDynamoDBDataManager _dynamoDBDataManager;
        private readonly ILogger<SessionService> _logger;

        public SessionService(IMemoryCache cache, IDynamoDBDataManager dynamoDBDataManager, ILogger<SessionService> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _dynamoDBDataManager = dynamoDBDataManager ?? throw new ArgumentNullException(nameof(dynamoDBDataManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string> CreateSessionAsync(Session newSession)
        {
            ArgumentNullException.ThrowIfNull(newSession);
            Debug.WriteLine($"Creating session: {newSession}");
           
            // Additional validation or business logic if needed
            await _dynamoDBDataManager.SaveItemAsync(newSession);
            Debug.WriteLine($"Saved {newSession.SessionID} in DynamoDB database");

            // Invalidate the cache to reflect the new data
            Debug.WriteLine($"Removed AllSessions from cache");
            _cache.Remove("AllSessions");

            _logger.LogInformation("New session saved to database. Cache invalidated.");

            return newSession.SessionID;
        }

        public async Task<Session?> GetSessionByIdAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            Debug.WriteLine($"Fetching session with ID: {sessionId}");

            // Check if the session exists in the cache
            string cacheKey = $"Session_{sessionId}";
            if (_cache.TryGetValue(cacheKey, out Session? cachedSession))
            {
                Debug.WriteLine($"Session with ID {sessionId} found in cache.");

                _logger.LogInformation($"Session with ID {sessionId} found in cache.");
                return cachedSession!;
            }
            _logger.LogInformation($"Session with ID {sessionId} not found in cache. Fetching from database.");
            Debug.WriteLine($"Session with ID {sessionId} not found in cache. Fetching from database.");

            // If not found in cache, fetch it from the database
            Session session = await _dynamoDBDataManager.GetItemAsync<Session>(sessionId);

            // Cache the fetched session
            if (session != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                    Priority = CacheItemPriority.High
                };
                _cache.Set(cacheKey, session, cacheOptions);

                _logger.LogInformation($"Session with ID {sessionId} fetched from database and cached.");
            }
            else
            {
                _logger.LogInformation($"Session with ID {sessionId} not found in database.");
            }

            return session;
        }

        public async Task DeleteSessionAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            Debug.WriteLine($"Deleting session with ID: {sessionId}");

            await _dynamoDBDataManager.DeleteItemAsync<Session>(sessionId);

            // Invalidate the cache after deletion
            _cache.Remove("AllSessions");
            _cache.Remove($"Session_{sessionId}");
            Debug.WriteLine($"removed AllSessions and : Session_{sessionId} from cache");

            _logger.LogInformation($"Session with ID {sessionId} deleted from database. Cache invalidated.");
        }

        public async Task UpdateSessionAsync(Session updatedSession)
        {
            if (updatedSession == null)
            {
                throw new ArgumentNullException(nameof(updatedSession), "Updated session cannot be null");
            }

            Debug.WriteLine($"Updating session with ID: {updatedSession.SessionID}");

            // Save the updated session back to the database
            await _dynamoDBDataManager.SaveItemAsync(updatedSession);

            // Invalidate the cache to reflect the updated session
            string cacheKey = $"Session_{updatedSession.SessionID}";
            _cache.Remove(cacheKey);

            Debug.WriteLine($"Session with ID {updatedSession.SessionID} updated successfully.");
            _logger.LogInformation($"Session with ID {updatedSession.SessionID} updated successfully.");
        }


        public async Task<IEnumerable<string>> GetSessionParticipantsAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            Debug.WriteLine($"Fetching participants for session with ID: {sessionId}");

            // Fetch the session from the database
            Session session = await _dynamoDBDataManager.GetItemAsync<Session>(sessionId);

            if (session != null)
            {
                return session.Participants;
            }
            else
            {
                // Session not found
                return new List<string>();
            }
        }


        public async Task AddUserToSessionAsync(string sessionId, string userNickname)
        {
           
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            if (string.IsNullOrEmpty(userNickname))
            {
                throw new ArgumentException("User Nickname cannot be null or empty.", nameof(userNickname));
            }

            Debug.WriteLine($"Adding user with nickname {userNickname} to session with ID: {sessionId}");

            // Fetch the session from the database
            Session session = await _dynamoDBDataManager.GetItemAsync<Session>(sessionId);

            if (session != null)
            {
                // Add the user to the session if it doesn't already exist
                if (!session.Participants.Contains(userNickname))
                {
                    session.Participants.Add(userNickname);
                }
                else
                {
                    // Username already exists, handle the situation (e.g., throw an exception, notify the user, etc.)
                    throw new Exception("Username already exists in the session.");
                }


                // Update the session in the database
                await _dynamoDBDataManager.SaveItemAsync(session);

                // Invalidate the cache to reflect the updated session
                string cacheKey = $"Session_{sessionId}";
                _cache.Set(cacheKey, session, new MemoryCacheEntryOptions());

                Debug.WriteLine($"User with ID {userNickname} added to session with ID: {sessionId}");
                _logger.LogInformation($"User with ID {userNickname} added to session with ID: {sessionId}");
            }
            else
            {
                // Session not found
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }
        }


        public async Task<IEnumerable<Session>> GetSessionsByUserIdAsync(string userId)
        {
            Debug.WriteLine($"1 service Getting sessions for user with ID: {userId}");

            if (string.IsNullOrEmpty(userId))
            {
                throw new ArgumentException("User ID cannot be null or empty.", nameof(userId));
            }

            Debug.WriteLine($"Getting sessions for user with ID: {userId}");

            // Fetch all sessions from the database
            IEnumerable<Session> allSessions = await _dynamoDBDataManager.GetAllItemsAsync<Session>();

            Debug.WriteLine($"found {allSessions.Count()} sessions in general!");
            // Filter sessions based on the user ID
            var sessionsForUser = allSessions.Where(session => session.HostUserID == userId);
            Debug.WriteLine($"found {sessionsForUser.Count()} sessions for {userId}!");

            return sessionsForUser;
        }

        public async Task SaveUserResponseAsync(string sessionId, UserResponse userResponse)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            if (userResponse == null)
            {
                throw new ArgumentNullException(nameof(userResponse), "User response cannot be null.");
            }

            try
            {
                Debug.WriteLine($"Saving user response for session with ID: {sessionId}");

                // Check if the user has already submitted a response for the same question within the session
                var existingResponse = await _dynamoDBDataManager.GetItemAsync<UserResponse>(sessionId, userResponse.Nickname);

                if (existingResponse != null && existingResponse.QuestionIndex == userResponse.QuestionIndex)
                {
                    // Handle the situation where the user has already submitted a response for the same question
                    // For example, you could update the existing response or reject the new response
                    // In this example, let's throw an exception to indicate that the user has already submitted a response for this question
                    Debug.WriteLine($"User has already submitted a response for this question");

                    throw new InvalidOperationException("User has already submitted a response for this question.");
                }

                // Validate the user response if needed

                // Save the user response to the data store
                // You can use your data access layer or repository here
                // For example, if you're using Entity Framework Core:
                // dbContext.UserResponses.Add(userResponse);
                // await dbContext.SaveChangesAsync();

                // Additional validation or business logic if needed

                await _dynamoDBDataManager.SaveItemAsync(userResponse);
                Debug.WriteLine($"User  {userResponse.Nickname} response saved successfully for session with ID: {sessionId}");
            }
            catch (Exception ex)
            {
                // Handle any errors or exceptions
                Debug.WriteLine($"Error saving user response for session with ID {sessionId}: {ex.Message}");
                throw;
            }
        }

        public async Task<SessionResult> GetSessionResultsAsync(string sessionId)
        {
            try
            {
                Debug.WriteLine($"Fetching session results for session with ID: {sessionId}");

                // Check if the session results are already cached
                string cacheKey = $"Result_{sessionId}";
                Debug.WriteLine($"Checking cache for session result with cache key: {cacheKey}");
                var cachedResults = _cache.Get<SessionResult>(cacheKey);

                if (cachedResults == null)
                {
                    Debug.WriteLine("Session results not found in cache. Aggregating session results...");
                    // Session results not cached, aggregate them
                    var sessionResult = await AggregateSessionResultsAsync(sessionId);

                    // Save session result to cache
                    _cache.Set(cacheKey, sessionResult);
                    Debug.WriteLine("Session result saved to cache.");

                    // Save session result to database (optional)
                    await _dynamoDBDataManager.SaveItemAsync(sessionResult); 
                    Debug.WriteLine("Session result saved to database.");

                    return sessionResult;
                }
                else
                {
                    Debug.WriteLine("Session results found in cache. Returning cached results...");
                    // Session results found in cache, return them
                    return cachedResults;
                }
            }
            catch (Exception ex)
            {
                // Handle any errors or exceptions
                Debug.WriteLine($"Error fetching session results for session with ID {sessionId}: {ex.Message}");
                throw; // Rethrow the exception for the controller to handle
            }
        }

        private async Task<SessionResult> AggregateSessionResultsAsync(string sessionId)
        {
            // Perform the aggregation of session results here
            // This method should return the aggregated session result
        }
    }
}
