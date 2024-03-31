using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Models.DTO;
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

        private readonly IQuizService _quizService;
        private readonly IMemoryCache _cache;
        private readonly IDynamoDBDataManager _dynamoDBDataManager;
        private readonly ILogger<SessionService> _logger;
        private readonly ISessionNotificationService _sessionNotificationService;


        public SessionService(ISessionNotificationService sessionNotificationService, IQuizService quizService, IMemoryCache cache, IDynamoDBDataManager dynamoDBDataManager, ILogger<SessionService> logger)
        {
            _sessionNotificationService = sessionNotificationService ?? throw new ArgumentNullException(nameof(sessionNotificationService));
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _dynamoDBDataManager = dynamoDBDataManager ?? throw new ArgumentNullException(nameof(dynamoDBDataManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _quizService = quizService ?? throw new ArgumentNullException(nameof(quizService));
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
            await _sessionNotificationService.NotifySessionUpdated(updatedSession.SessionID);

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
                await _sessionNotificationService.NotifySessionUpdated(sessionId);

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

        public async Task<bool> SaveQuestionResponseAsync(AnswerSubmissionDto answerSubmission)
        {
            try
            {
                // Extract data from the DTO
                string sessionId = answerSubmission.SessionId;
                string nickname = answerSubmission.Nickname;
                int questionIndex = answerSubmission.QuestionIndex;
                List<int> selectedOptions = answerSubmission.SelectedOptions;
                long timeTaken = answerSubmission.TimeTaken;

                // Perform validation on the received data
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    throw new ArgumentException("Session ID is required", nameof(sessionId));
                }

                if (string.IsNullOrWhiteSpace(nickname))
                {
                    throw new ArgumentException("Nickname is required", nameof(nickname));
                }

                if (questionIndex < 0)
                {
                    throw new ArgumentOutOfRangeException(nameof(questionIndex), "Question index must be non-negative");
                }

                if (selectedOptions == null || selectedOptions.Count == 0)
                {
                    throw new ArgumentException("At least one option must be selected", nameof(selectedOptions));
                }

                Session? session = await GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    throw new ArgumentException($"Cannot find session {sessionId}", nameof(sessionId));
                }
                Quiz? quiz = await _quizService.GetQuizAsync(session.AssociatedQuizID);
                
                if (quiz == null)
                {
                    throw new ArgumentException($"Cannot find session {sessionId}", nameof(sessionId));
                }

                bool isCorrect = calculateIsCorrect(quiz.Questions[questionIndex].CorrectOptions, selectedOptions);
                int numQuestions = quiz.Questions.Count();

                // Create the response object
                Response response = new Response
                {
                    SelectedOptions = selectedOptions,
                    TimeTaken = timeTaken,
                    IsCorrect = isCorrect
                };
                Debug.WriteLine($"response is ready : {JsonConvert.SerializeObject(answerSubmission)}");

                // Calculate whether the response is correct

                // Create or retrieve the SessionUserResponses object for the given session ID and nickname
                SessionUserResponses? currentResponses = await getSessionUserResponsesAsync(sessionId, nickname);
                SessionUserResponses sessionUserResponses;
                if (currentResponses == null)
                {
                    Debug.WriteLine($"sessionUserResponses is null");

                    // If the SessionUserResponses object doesn't exist, create a new one
                    sessionUserResponses = new SessionUserResponses
                    {
                        SessionID = sessionId,
                        Nickname = nickname,
                    };
                    Debug.WriteLine($"sessionUserResponses was null, now: : {JsonConvert.SerializeObject(sessionUserResponses)}");

                }
                else if (currentResponses.ResponsesByQuestion.ContainsKey(questionIndex))
                {
                    Debug.WriteLine($"Nickname '{nickname}' has already answered question at index {questionIndex}");

                    // Check if the nickname has already answered the question at the specified index
                    throw new InvalidOperationException($"Nickname '{nickname}' has already answered question at index {questionIndex}");
                }
                else
                {
                    sessionUserResponses = currentResponses;
                }

                Debug.WriteLine($"adding response to ResponsesByQuestion dictionary");

                Debug.WriteLine($"sessionUserResponses is ready : {JsonConvert.SerializeObject(sessionUserResponses)}");

                // Save or update the QuestionResponse object at the specified question index
                sessionUserResponses.ResponsesByQuestion.Add(questionIndex, response);
                Debug.WriteLine($"response added, ResponsesByQuestion: {JsonConvert.SerializeObject(sessionUserResponses.ResponsesByQuestion)} ");

                // Save the SessionUserResponses object to the database
                await _dynamoDBDataManager.SaveItemAsync(sessionUserResponses);

                Debug.WriteLine($"response saved in database, isCorrect = {isCorrect}");

                Debug.WriteLine(isCorrect ? "correct" : "not correct");
                await _sessionNotificationService.NotifyQuestionResponseSubmitted(sessionId, nickname, questionIndex, isCorrect);


                return isCorrect; // Return whether the response is correct
            }
            catch (Exception ex)
            {
                // Log the error and handle exceptions as needed
                Debug.WriteLine($"Error saving question response: {ex.Message}  \n data: {ex.Data}, \nStackTrace:  {ex.StackTrace}");
                throw;
            }
        }

        private bool calculateIsCorrect(List<int> correctOptions, List<int> selectedOptions)
        {
            // Check if both lists have the same elements, regardless of their order
            bool res = correctOptions.OrderBy(o => o).SequenceEqual(selectedOptions.OrderBy(o => o));
            Debug.WriteLine($"in calculateIsCorrect, result: {res}");

            return res;
        }


        public async Task<SessionResult> GetSessionResultsAsync(string sessionId)
        {
            //TODO: add check that session is ended! else ther's no resluts yet..
            try
            {
                Debug.WriteLine($"Fetching session results for session with ID: {sessionId}");

                // Check if the session results are already cached
                string cacheKey = $"Result_{sessionId}";
                Debug.WriteLine($"Checking cache for session result with cache key: {cacheKey}");
                var cachedResults = _cache.Get<SessionResult>(cacheKey);

                if (cachedResults != null)
                {
                    // If session results are found in the cache, return them
                    Debug.WriteLine($"Session results found in cache for session with ID: {sessionId}");
                    return cachedResults;
                }

                // If session results are not cached, fetch them from the database
                SessionResult sessionResult = await _dynamoDBDataManager.GetItemAsync<SessionResult>(sessionId);

                if (sessionResult == null)
                {
                    // If no session result is found, create it and save to db
                    sessionResult = await createSessionResultAsync(sessionId);
                    await _dynamoDBDataManager.SaveItemAsync(sessionResult);
                }

                // Cache the fetched or newly created session results
                _cache.Set(cacheKey, sessionResult, new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10) // Set cache expiration time
                });

                Debug.WriteLine($"Session results fetched and cached successfully for session with ID: {sessionId}");

                return sessionResult;
            }
            catch (Exception ex)
            {
                // Log any errors and handle exceptions as needed
                Debug.WriteLine($"Error retrieving session results for session ID {sessionId}: {ex.Message}");
                throw;
            }
        }

        private async Task<SessionResult> createSessionResultAsync(string sessionId)
        {
            // Get the session information using the session service
            Session? session = await GetSessionByIdAsync(sessionId);

            if (session == null)
            {
                // If the session doesn't exist, throw an exception
                throw new Exception($"Session with ID {sessionId} not found.");
            }


            // Create a new SessionResult object
            SessionResult sessionResult = new SessionResult
            {
                SessionID = sessionId,
                ParticipantResults = new List<ParticipantResult>()
            };

            // Iterate through participants and retrieve their responses
            foreach (var participant in session.Participants)
            {
                // Retrieve the session user responses for the participant
                SessionUserResponses? sessionUserResponses = await getSessionUserResponsesAsync(sessionId, participant);

                if (sessionUserResponses == null)
                {
                    throw new Exception($"No session user responses found for participant {participant} in session {sessionId}");
                }
                else
                {
                    // Calculate participant's metrics (e.g., number of correct answers, average response time)
                    // Add the participant's result to the session result
                    ParticipantResult participantResult = await calculateParticipantResult(sessionUserResponses, session.AssociatedQuizID);
                    sessionResult.ParticipantResults.Add(participantResult);
                }
            }

            return sessionResult;
        }

        private async Task<ParticipantResult> calculateParticipantResult(SessionUserResponses sessionUserResponses, string quizId)
        {
            // Get the quiz asynchronously
            Quiz? quiz = await _quizService.GetQuizAsync(quizId);

            // Check if the quiz exists
            if (quiz == null)
            {
                // If the quiz doesn't exist, throw an exception
                throw new Exception($"Quiz {quizId} of session {sessionUserResponses.SessionID} not found.");
            }

            // Initialize a ParticipantResult object
            ParticipantResult result = new ParticipantResult();

            // Get the total number of questions in the quiz
            int totalQuestions = quiz.Questions.Count;

            // Initialize counters for correct answers and total response time
            int totalCorrectAnswers = 0;
            long totalResponseTime = 0;

            foreach (var questionIndex in sessionUserResponses.ResponsesByQuestion.Keys)
            {
                // Check if the question index is within the range of questions in the quiz
                if (questionIndex >= 0 && questionIndex < totalQuestions)
                {
                    // Retrieve the corresponding question from the quiz
                    Question question = quiz.Questions[questionIndex];

                    // Check if the participant has responded to this question
                    if (sessionUserResponses.ResponsesByQuestion.TryGetValue(questionIndex, out var response))
                    {
                        // Check if the response is correct
                        if (response.IsCorrect)
                        {
                            // Increment the total correct answers count
                            totalCorrectAnswers++;
                        }

                        // Add the time taken for this question to the total response time
                        totalResponseTime += response.TimeTaken;
                    }
                }
            }

            // Calculate the average response time
            double averageResponseTime = totalQuestions > 0 ? (double)totalResponseTime / totalQuestions : 0;

            // Populate the ParticipantResult object
            result.Nickname = sessionUserResponses.Nickname;
            result.NumCorrectAnswers = totalCorrectAnswers;
            result.AverageResponseTime = averageResponseTime;

            return result;
        }


        private async Task<SessionUserResponses?> getSessionUserResponsesAsync(string sessionId, string participant)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                Debug.WriteLine($"Session ID cannot be null or empty.");

                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            if (string.IsNullOrEmpty(participant))
            {
                Debug.WriteLine($"Participant cannot be null or empty.");

                throw new ArgumentException("Participant cannot be null or empty.", nameof(participant));
            }

            Debug.WriteLine($"Fetching session user responses for participant {participant} in session with ID: {sessionId}");

            // Check if the session user responses exist in the cache
            string cacheKey = $"SessionUserResponses_{sessionId}_{participant}";
            if (_cache.TryGetValue(cacheKey, out SessionUserResponses? cachedResponses))
            {
                Debug.WriteLine($"Session user responses for participant {participant} in session with ID {sessionId} found in cache.");
                return cachedResponses;
            }

            Debug.WriteLine($"Session user responses for participant {participant} in session with ID {sessionId} not found in cache. Fetching from database.");

            // Fetch user responses from the database
            try
            {
                SessionUserResponses? userResponses = await _dynamoDBDataManager.GetItemAsync<SessionUserResponses>(sessionId, participant);
                Debug.WriteLine($"userResponses: {userResponses}.");

                if (userResponses != null)
                {
                Debug.WriteLine($"userResponses is not null, cacheing it.");

                    var cacheOptions = new MemoryCacheEntryOptions
                    {
                        AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                        Priority = CacheItemPriority.High
                    };
                    _cache.Set(cacheKey, userResponses, cacheOptions);

                    Debug.WriteLine($"Session user responses for participant {participant} in session with ID {sessionId} fetched from database and cached.");

                    return userResponses;
                }
                else
                {
                    Debug.WriteLine($"Session user responses for participant {participant} in session with ID {sessionId} not found in database.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                // Log the exception and return null
                Debug.WriteLine($"Error fetching session user responses for participant {participant} in session with ID {sessionId}: {ex.Message}");
                return null;
            }
        }


    }
}
