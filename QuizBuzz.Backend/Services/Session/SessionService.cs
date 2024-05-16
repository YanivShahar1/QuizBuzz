using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Models.DTO;
using QuizBuzz.Backend.Services.Interfaces;
using QuizBuzz.Backend.Services.Managers;
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
        private readonly SessionCacheService _sessionCacheService;
        private readonly SessionManager _sessionManager;
        private readonly IDynamoDBDataManager _dynamoDBDataManager;
        private readonly ILogger<SessionService> _logger;
        private readonly ISessionNotificationService _sessionNotificationService;

        public SessionService(ISessionNotificationService sessionNotificationService, IQuizService quizService, SessionCacheService sessionCacheService, IDynamoDBDataManager dynamoDBDataManager, ILogger<SessionService> logger)
        {
            _sessionNotificationService = sessionNotificationService ?? throw new ArgumentNullException(nameof(sessionNotificationService));
            _sessionCacheService = sessionCacheService ?? throw new ArgumentNullException(nameof(sessionCacheService));
            _dynamoDBDataManager = dynamoDBDataManager ?? throw new ArgumentNullException(nameof(dynamoDBDataManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _quizService = quizService ?? throw new ArgumentNullException(nameof(quizService));

            _sessionManager = new SessionManager();
        }


        public async Task<string> SaveSessionAsync(Session newSession)
        {
            _sessionManager.InitializeSessionWithId(newSession);
            await _dynamoDBDataManager.SaveItemAsync(newSession);
            _logger.LogInformation($"Saved {newSession.SessionID} in DynamoDB database");
            return newSession.SessionID;
        }


        public async Task<Session?> GetSessionAsync(string sessionId)
        {
            Session? cachedSession = _sessionCacheService.GetItem(sessionId);
            if (cachedSession != null)
            {
                return cachedSession;
            }
            // If not found in cache, fetch it from the database
            Session session = await _dynamoDBDataManager.GetItemAsync<Session>(sessionId);

            // Cache the fetched session
            if (session != null)
            {
               _sessionCacheService.CacheItem(sessionId, session);
                _logger.LogInformation($"Session with ID {sessionId} fetched from database and cached.");
                return session;
            }
            else
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }
        }


        public async Task DeleteSessionAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            Debug.WriteLine($"Deleting session with ID: {sessionId}");

            await _dynamoDBDataManager.DeleteItemAsync<Session>(sessionId);

            _sessionCacheService.RemoveItemAsync(sessionId);
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

            // Save updated session in cache
            _sessionCacheService.CacheItem(updatedSession.SessionID,updatedSession);

            // Notify subscribers about the updated session
            await _sessionNotificationService.NotifySessionUpdated(updatedSession.SessionID);

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
            Session? session = await GetSessionAsync(sessionId);

            if (session != null)
            {
                return session.Participants;
            }
            else
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }
        }


        public async Task AddUserToSessionAsync(string sessionId, string userNickname)
        {

            // Fetch the session from the database
            Session? session = await GetSessionAsync(sessionId);

            if (session != null)
            {
                _sessionManager.AddParticipantToSession(session, userNickname);

                // Update the session in the database,cache and notify about the update
                await _dynamoDBDataManager.SaveItemAsync(session);
                _sessionCacheService.CacheItem(sessionId, session);
                await _sessionNotificationService.NotifySessionUpdated(sessionId);
                _logger.LogInformation($"User with ID {userNickname} added to session with ID: {sessionId}");
            }
            else
            {
                // Session not found
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }
        }


        public async Task<IEnumerable<Session>> GetUserSessions(string hostUserId)
        {

            if (string.IsNullOrEmpty(hostUserId))
            {
                throw new ArgumentException("Host user ID cannot be null or empty.", nameof(hostUserId));
            }

            var sessions = await _dynamoDBDataManager.QueryItemsByIndexAsync<Session>(HostUserIDIndexName, HostUserIDAttributeName, hostUserId);
            var sessionIds = sessions.Select(session => session.SessionID).ToList();
            _sessionCacheService.CacheUserSessionIds(hostUserId, sessionIds);
         
            return sessions;
        }

        public async Task<bool> UpdateUserResponsesAsync(AnswerSubmissionDto answerDto)
        {
            try
            {
                string sessionId = answerDto.SessionId;
                Session? session = await GetSessionAsync(sessionId);
                if (session == null)
                {
                    throw new ArgumentException($"Cannot find session {sessionId}", nameof(sessionId));
                }

                Quiz? quiz = await _quizService.GetQuizAsync(session.AssociatedQuizID);
                if (quiz == null)
                {
                    throw new ArgumentException($"Cannot find quiz {session.AssociatedQuizID}", nameof(session.AssociatedQuizID));
                }
                
                Response response = _sessionManager.CreateQuestionResponse(answerDto, quiz);

                UserResponses? currentResponses = await getSessionUserResponsesAsync(sessionId, answerDto.Nickname);
                UserResponses sessionUserResponses = _sessionManager.AddUserResponse(currentResponses, response, answerDto);
                
                // Save the SessionUserResponses object to the database
                await _dynamoDBDataManager.SaveItemAsync(sessionUserResponses);
                
                _logger.LogInformation($"response saved in database, isCorrect = {response.IsCorrect}");
                await _sessionNotificationService.NotifyQuestionResponseSubmitted(sessionId, answerDto.Nickname, answerDto.QuestionIndex, response.IsCorrect);
                return response.IsCorrect; // Return whether the response is correct
            }
            catch (Exception ex)
            {
                // Log the error and handle exceptions as needed
                _logger.LogError($"Error saving question response: {ex.Message}  \n data: {ex.Data}, \nStackTrace:  {ex.StackTrace}");
                throw;
            }
        }


        public async Task<SessionResult> GetSessionResultsAsync(string sessionId)
        {
            //TODO: add check that session is ended! else ther's no resluts yet..
            try
            {
                var cachedResults = _sessionCacheService.GetSessionResult(sessionId);

                if (cachedResults != null)
                {
                    _logger.LogInformation($"Session results found in cache for session with ID: {sessionId}");
                    return cachedResults;
                }

                // If session results are not cached, fetch them from the database
                SessionResult sessionResult = await _dynamoDBDataManager.GetItemAsync<SessionResult>(sessionId);

                if (sessionResult == null)
                {
                    // If no session result is found, create it and save to db
                    Session? session = await GetSessionAsync(sessionId);    
                    if(session == null)
                    {
                        throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
                    }

                    Dictionary<string, UserResponses> participantsResponses = new Dictionary<string, UserResponses>();
                    // Iterate through participants and retrieve their responses
                    foreach (var participant in session.Participants)
                    {
                        // Retrieve the session user responses for the participant
                        UserResponses? sessionUserResponses = await getSessionUserResponsesAsync(sessionId, participant);


                        if (sessionUserResponses == null)
                        {
                            throw new Exception($"No session user responses found for participant {participant} in session {sessionId}");
                        }
                        participantsResponses.Add(participant, sessionUserResponses);
                    }

                    Quiz? quiz = await _quizService.GetQuizAsync(session.AssociatedQuizID);
                    if (quiz == null)
                    {
                        throw new KeyNotFoundException($"quiz of session with ID {sessionId} not found.");
                    }
                    sessionResult = _sessionManager.CreateSessionResult(session, participantsResponses, quiz);
                    await _dynamoDBDataManager.SaveItemAsync(sessionResult);
                }

                _sessionCacheService.CacheSessionResult(sessionId, sessionResult);

                _logger.LogInformation($"Session results fetched and cached successfully for session with ID: {sessionId}");

                return sessionResult;
            }
            catch (Exception ex)
            {
                // Log any errors and handle exceptions as needed
                Debug.WriteLine($"Error retrieving session results for session ID {sessionId}: {ex.Message}");
                throw;
            }
        }
       

        private async Task<UserResponses?> getSessionUserResponsesAsync(string sessionId, string participantName)
        {

            UserResponses? cachedUserResponses = _sessionCacheService.GetUserResponses(sessionId, participantName);

            if (cachedUserResponses != null)
            {
                return cachedUserResponses;
            }

            // Fetch user responses from the database
            try
            {
                UserResponses? userResponses = await _dynamoDBDataManager.GetItemAsync<UserResponses>(sessionId, participantName);
                Debug.WriteLine($"userResponses: {userResponses}.");

                if (userResponses != null)
                {
                    _sessionCacheService.CacheUserResponses(sessionId,participantName,userResponses);
                    _logger.LogInformation($"Session user responses for participant {participantName} in session with ID {sessionId} fetched from database and cached.");
                    return userResponses;
                }
                else
                {
                    _logger.LogInformation($"Session user responses for participant {participantName} in session with ID {sessionId} not found in database.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                // Log the exception and return null
                _logger.LogError($"Error fetching session user responses for participant {participantName} in session with ID {sessionId}: {ex.Message}");
                return null;
            }
        }

        public async Task FinishSessionAsync(string sessionId)
        {
            try
            {
                // Fetch the session from the database
                Session? session = await GetSessionAsync(sessionId);
                if (session == null)
                {
                    throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
                }
                _sessionManager.FinishSession(session);

                // Save the updated session in the database
                await UpdateSessionAsync(session);

                Debug.WriteLine($"Session with ID {sessionId} has been finished successfully.");
                _logger.LogInformation($"Session with ID {sessionId} has been finished successfully.");
            }
            catch (Exception ex)
            {
                // Log the error and handle exceptions
                Debug.WriteLine($"Error finishing session {sessionId}: {ex.Message}");
                _logger.LogError(ex, $"Error finishing session {sessionId}: {ex.Message}");
                throw; // Rethrow the exception to be handled by the caller
            }
        }


        public async Task<IEnumerable<UserResponses>> GetSessionResponsesAsync(string sessionId)
        {
            // Fetch the session from the database
            Session session = await _dynamoDBDataManager.GetItemAsync<Session>(sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }

            // Initialize a list to store user responses
            List<UserResponses> userResponsesList = new List<UserResponses>();

            // Iterate over the participants in the session
            foreach (string participant in session.Participants)
            {
                // Fetch user responses for each participant
                UserResponses userResponses = await _dynamoDBDataManager.GetItemAsync<UserResponses>(sessionId, participant);

                if (userResponses != null)
                {
                    // Add user responses to the list
                    userResponsesList.Add(userResponses);
                }
            }

            return userResponsesList;
        }
    }
}
