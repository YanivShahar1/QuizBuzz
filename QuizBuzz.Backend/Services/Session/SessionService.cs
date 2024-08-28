using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.DTOs;
using QuizBuzz.Backend.Enums;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Mappers;
using QuizBuzz.Backend.Services.Interfaces;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text.Json;
using System.Threading.Tasks;
using Amazon.Runtime.Internal.Transform;
using System.Text;
using Amazon.DynamoDBv2;
using System.Globalization;

namespace QuizBuzz.Backend.Services
{
    public class SessionService : ISessionService
    {
        private const string dynamoDBTableName = "Sessions";
        private const string hostUserIDIndexName = "HostUserID-index";
        private const string createdAtStatusIndexName = "SessionStatus-CreatedAt-index";
        private const string hostUserIDAttributeName = "HostUserID";

        private readonly IQuizService _quizService;
        private readonly ICacheService<Session> _sessionCacheService;
        private readonly ICacheService<SessionResult> _sessionResultCacheService;
        private readonly ICacheService<UserResponses> _userResponsesCacheService;
        private readonly SessionManager _sessionManager;
        private readonly IDynamoDBManager _dynamoDBManager;
        private readonly ILogger<SessionService> _logger;
        private readonly ISessionNotificationService _sessionNotificationService;

        private string generateUserResponsesCacheKey(string sessionId, string userName) => ($"{sessionId}_{userName}");

        public SessionService(ISessionNotificationService sessionNotificationService,
                                IQuizService quizService,
                                IDynamoDBManager dynamoDBDataManager,
                                ILogger<SessionService> logger,
                                ICacheService<Session> sessionCacheService,
                                ICacheService<SessionResult> sessionResultCacheService,
                                ICacheService<UserResponses> userResponsesCacheService)
        {
            _sessionNotificationService = sessionNotificationService ?? throw new ArgumentNullException(nameof(sessionNotificationService));
            _dynamoDBManager = dynamoDBDataManager ?? throw new ArgumentNullException(nameof(dynamoDBDataManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _quizService = quizService ?? throw new ArgumentNullException(nameof(quizService));

            _sessionCacheService = sessionCacheService ?? throw new ArgumentNullException(nameof(sessionCacheService));
            _sessionResultCacheService = sessionResultCacheService ?? throw new ArgumentNullException(nameof(sessionResultCacheService));
            _userResponsesCacheService = userResponsesCacheService ?? throw new ArgumentNullException(nameof(userResponsesCacheService));

            _sessionManager = new SessionManager(_sessionNotificationService);
        }


        public async Task<string> SubmitSessionAsync(Session session)
        {
            _sessionManager.InitializeSessionWithId(session);
            await _dynamoDBManager.SaveItemAsync(session);
            _logger.LogInformation($"Saved {session.SessionID} in DynamoDB database");
            return session.SessionID;
        }

        public async Task<IEnumerable<Session>> FetchByDateAndStatusAsync(string? sessionStatus, string? startDate, string? endDate)
        {
            // Define the expected date formats
            string[] formats = { "yyyy-MM-ddTHH:mm:ssZ", "yyyy-MM-dd" };
            DateTime defaultStartDate = DateTime.MinValue;
            DateTime defaultEndDate = DateTime.MaxValue;

            // Try to parse startDate
            if (string.IsNullOrEmpty(startDate) || !DateTime.TryParseExact(startDate, formats,
                CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime o_startDate))
            {
                _logger.LogInformation("Using default startDate");
                startDate = defaultStartDate.ToString("yyyy-MM-ddTHH:mm:ssZ");
            }

            // Try to parse endDate
            if (string.IsNullOrEmpty(endDate) || !DateTime.TryParseExact(endDate, formats,
                CultureInfo.InvariantCulture, DateTimeStyles.None, out DateTime o_endDate))
            {
                _logger.LogInformation("Using default endDate");
                endDate = defaultEndDate.ToString("yyyy-MM-ddTHH:mm:ssZ");
            }

            _logger.LogInformation($"Fetching sessions with status {sessionStatus ?? "any"} from {startDate} to {endDate}");


            // Convert startDate and endDate to the string format used in DynamoDB
            string startKey = startDate;
            string endKey = endDate;

            _logger.LogInformation($"fetching by date and status from  {startDate} to {endDate} with status {sessionStatus}");
            var queryRequest = new QueryRequest
            {
                TableName = dynamoDBTableName,  
                IndexName = createdAtStatusIndexName, 
                KeyConditionExpression = "SessionStatus = :sessionStatus AND CreatedAt BETWEEN :startKey AND :endKey",
                ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                    {
                        { ":startKey", new AttributeValue { S = startKey } },
                        { ":endKey", new AttributeValue { S = endKey } },
                        { ":sessionStatus", new AttributeValue { S = sessionStatus } }
                    }
            };

            // Convert QueryRequest to JSON string
            string queryRequestJson = JsonConvert.SerializeObject(queryRequest, Formatting.Indented);

            // Log the JSON representation of the QueryRequest
            _logger.LogInformation($"QueryRequest JSON: {queryRequestJson}, KeyConditionExpression: {queryRequest.KeyConditionExpression}");


            try
            {
                var response = await _dynamoDBManager.QueryAsync(queryRequest);

                // Convert response items to Session objects
                var sessions = new List<Session>();
                foreach (var item in response.Items)
                {
                    sessions.Add(DynamoDBMapper.MapToSession(item));
                }

                return sessions;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching sessions from DynamoDB");
                throw;
            }
        }


        public async Task<Session> FetchSessionAsync(string sessionId)
        {
            Session session;
            Session? cachedSession = _sessionCacheService.GetItem(sessionId);
            if (cachedSession != null)
            {
                session =  cachedSession;
            }
            // If not found in cache, fetch it from the database
            session = await _dynamoDBManager.GetItemAsync<Session>(sessionId);

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

            // Delete session from database and cache
            await _dynamoDBManager.DeleteItemAsync<Session>(sessionId);
            _sessionCacheService.RemoveItem(sessionId);
            _logger.LogInformation($"Session with ID {sessionId} deleted from database. Cache invalidated.");
        }

        public async Task DeleteSessionsAsync(List<string> sessionIds)
        {
            if (sessionIds == null || !sessionIds.Any())
            {
                throw new ArgumentException("Session IDs cannot be null or empty.", nameof(sessionIds));
            }

            var writeRequests = sessionIds.Select(sessionId => new WriteRequest
            {
                DeleteRequest = new DeleteRequest
                {
                    Key = new Dictionary<string, AttributeValue>
                    {
                        { "SessionID", new AttributeValue { S = sessionId } }
                     }
                }
            }).ToList();

            var requestItems = new Dictionary<string, List<WriteRequest>>
            {
                {dynamoDBTableName , writeRequests }
            };

            await _dynamoDBManager.BatchWriteItemAsync(requestItems);

            foreach (var sessionId in sessionIds)
            {
                _sessionCacheService.RemoveItem(sessionId);
            }

            _logger.LogInformation($"Sessions with IDs {string.Join(", ", sessionIds)} deleted from database. Cache invalidated.");
        }


        public async Task SaveSessionAsync(Session updatedSession)
        {
            if (updatedSession == null)
            {
                throw new ArgumentNullException(nameof(updatedSession), "Updated session cannot be null");
            }
            // Save updated session in cache
            _sessionCacheService.CacheItem(updatedSession.SessionID, updatedSession);
            await _dynamoDBManager.SaveItemAsync(updatedSession);
        }

        public async Task<IEnumerable<string>> GetSessionParticipantsAsync(string sessionId)
        {
            Session session = await FetchSessionAsync(sessionId);
            return session.Participants;
        }


        public async Task JoinSession(string sessionId, string userNickname)
        {
            Session? session = await FetchSessionAsync(sessionId);
            if (session != null)
            {
                _sessionManager.AddParticipantToSession(session, userNickname);
                await SaveSessionAsync(session);
                await _sessionNotificationService.NotifyUserJoined(sessionId, userNickname);
                _logger.LogInformation($"User with ID {userNickname} added to session with ID: {sessionId}");
            }
            else
            {
                _logger.LogInformation($"Session with ID {sessionId} not found");
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }
        }

        public async Task<bool> ValidateSessionAdmin(string sessionid, string userName)
        {
            Session session = await FetchSessionAsync(sessionid);
            return (session.HostUserID == userName);
        }

        public async Task StartSession(string sessionId)
        {
            Session? session = await FetchSessionAsync(sessionId);
           
            _sessionManager.StartSession(session);
            await SaveSessionAsync(session);
            await _sessionNotificationService.NotifySessionStarted(sessionId);
            _logger.LogInformation($"Session with ID {sessionId} has started ");

        }


        public async Task<IEnumerable<Session>> GetSessionsByHostId(string hostUserId)
        {

            if (string.IsNullOrEmpty(hostUserId))
            {
                throw new ArgumentException("Host user ID cannot be null or empty.", nameof(hostUserId));
            }


            IEnumerable<Session> sessions = await _dynamoDBManager.QueryItemsByIndexAsync<Session>(hostUserIDIndexName, hostUserIDAttributeName, hostUserId);
            _logger.LogInformation("sessions");

            foreach (var session in sessions)
            {
                string sessionJson = JsonConvert.SerializeObject(session);
                _logger.LogInformation(sessionJson);
            }
            var sessionIds = sessions.Select(session => session.SessionID).ToList();
         
            return sessions;
        }

        public async Task<bool> SubmitUserAnswerAsync(AnswerSubmissionDto answerDto)
        {
            try
            {
                _logger.LogInformation($"SubmitUserAnswerAsync,answer : {answerDto}");
                string sessionId = answerDto.SessionId;
                Session? session = await FetchSessionAsync(sessionId);
               

                Quiz quiz = await _quizService.FetchQuizAsync(session.AssociatedQuizID);
                
                Response response = _sessionManager.CreateQuestionResponse(answerDto, quiz);

                UserResponses? currentResponses = await fetchSessionUserResponsesAsync(sessionId, answerDto.Nickname);
                UserResponses sessionUserResponses = _sessionManager.AddUserResponse(currentResponses, response, answerDto);
                // Save the SessionUserResponses object to the database
                await _dynamoDBManager.SaveItemAsync(sessionUserResponses);
                _logger.LogInformation($"response saved in database, isCorrect = {response.IsCorrect}");

                await _sessionNotificationService.NotifyAdminUserAnswered(sessionId, answerDto.Nickname, answerDto.QuestionIndex, response);
                await notifyIfQuestionChanged(answerDto.QuestionIndex, answerDto.SessionId, quiz.Questions.Count);
                
                return response.IsCorrect; // Return whether the response is correct
            }
            catch (Exception ex)
            {
                // Log the error and handle exceptions as needed
                _logger.LogError($"Error saving question response: {ex.Message}  \n data: {ex.Data}, \nStackTrace:  {ex.StackTrace}");
                throw;
            }
        }


        public async Task<SessionResult> FetchSessionResultsAsync(string sessionId)
        {
            //TODO: add check that session is ended! else ther's no resluts yet..
            try
            {
                var cachedResults = _sessionResultCacheService.GetItem(sessionId);

                if (cachedResults != null)
                {
                    _logger.LogInformation($"Session results found in cache for session with ID: {sessionId}");
                    return cachedResults;
                }

                // If session results are not cached, fetch them from the database
                SessionResult sessionResult = await _dynamoDBManager.GetItemAsync<SessionResult>(sessionId);

                if (sessionResult == null)
                {
                    // If no session result is found, create it and save to db
                    Session session = await FetchSessionAsync(sessionId); 
                 

                    Dictionary<string, UserResponses> participantsResponses = new Dictionary<string, UserResponses>();
                    // Iterate through participants and retrieve their responses
                    foreach (var participant in session.Participants)
                    {
                        // Retrieve the session user responses for the participant
                        UserResponses? sessionUserResponses = await fetchSessionUserResponsesAsync(sessionId, participant);

                        if (sessionUserResponses == null)
                        {
                            throw new Exception($"No session user responses found for participant {participant} in session {sessionId}");
                        }
                        participantsResponses.Add(participant, sessionUserResponses);
                    }

                    Quiz? quiz = await _quizService.FetchQuizAsync(session.AssociatedQuizID);
                    sessionResult = _sessionManager.CreateSessionResult(session, participantsResponses, quiz);
                    await _dynamoDBManager.SaveItemAsync(sessionResult);
                }

                _sessionResultCacheService.CacheItem(sessionId, sessionResult);

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


        private async Task notifyIfQuestionChanged(int oldQuestionIndex, string sessionId, int totalQuestions)
        {
            if (_sessionManager.HasQuestionIndexChanged(sessionId, oldQuestionIndex))
            {
                //questionchanged. last user from the session participants that answering current question
                int currentQuestionIndex = _sessionManager.GetCurrentQuestionIndex(sessionId);

                if (currentQuestionIndex >= totalQuestions)
                {
                    await FinishSessionAsync(sessionId);
                    await _sessionNotificationService.NotifySessionFinished(sessionId);
                }
                else
                {
                    await _sessionNotificationService.NotifyNewQuestionIndex(sessionId, currentQuestionIndex);
                }
            }
        }

        private async Task<UserResponses?> fetchSessionUserResponsesAsync(string sessionId, string nickname)
        {

            UserResponses? cachedUserResponses = _userResponsesCacheService.GetItem($"{sessionId}_{nickname}");

            if (cachedUserResponses != null)
            {
                return cachedUserResponses;
            }

            // Fetch user responses from the database
            try
            {
                UserResponses? userResponses = await _dynamoDBManager.GetItemAsync<UserResponses>(sessionId, nickname);
                Debug.WriteLine($"userResponses: {userResponses}.");

                if (userResponses != null)
                {
                    _userResponsesCacheService.CacheItem(generateUserResponsesCacheKey(sessionId,nickname),userResponses);
                    _logger.LogInformation($"Session user responses for participant {nickname} in session with ID {sessionId} fetched from database and cached.");
                    return userResponses;
                }
                else
                {
                    _logger.LogInformation($"Session user responses for participant {nickname} in session with ID {sessionId} not found in database.");
                    return null;
                }
            }
            catch (Exception ex)
            {
                // Log the exception and return null
                _logger.LogError($"Error fetching session user responses for participant {nickname} in session with ID {sessionId}: {ex.Message}");
                return null;
            }
        }

        public async Task FinishSessionAsync(string sessionId)
        {
            try
            {
                // Fetch the session from the database
                Session? session = await FetchSessionAsync(sessionId);
                if (session == null)
                {
                    throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
                }
                _sessionManager.FinishSession(session);

                // Save the updated session in the database
                await SaveSessionAsync(session);
                

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
            Session session = await _dynamoDBManager.GetItemAsync<Session>(sessionId);

            if (session == null)
            {
                throw new KeyNotFoundException($"Session with ID {sessionId} not found.");
            }

            // Initialize a list to stnotiore user responses
            List<UserResponses> userResponsesList = new List<UserResponses>();

            // Iterate over the participants in the session
            foreach (string participant in session.Participants)
            {
                // Fetch user responses for each participant
                UserResponses userResponses = await _dynamoDBManager.GetItemAsync<UserResponses>(sessionId, participant);

                if (userResponses != null)
                {
                    // Add user responses to the list
                    userResponsesList.Add(userResponses);
                }
            }

            return userResponsesList;
        }



        //public async Task<IEnumerable<Session>> GetSessionsByStatusAsync(string status)
        //{
        //    try
        //    {
        //        _logger.LogInformation($"GetSessionsByStatusAsync : Status: {status}");
        //        // Query the items using the GSI for Status

        //        var sessions = await _dynamoDBManager.QueryItemsByIndexAsync<Session>(
        //            indexName: statusIndexName,
        //            partitionKey: statusAttributeName,
        //            partitionValue: status
        //        );
        //        _logger.LogInformation($"Found {sessions.Count()} sessions with status {status}");

        //        return sessions;

        //    }
        //    catch(Exception ex)
        //    {
        //        _logger.LogError(ex, "Error occurred while querying sessions by status.");
        //        throw;
        //    }
            
        //}
    }
}
