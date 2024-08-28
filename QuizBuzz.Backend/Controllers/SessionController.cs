using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using QuizBuzz.Backend.Models;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using Newtonsoft.Json;
using Amazon.Runtime.Internal.Util;
using QuizBuzz.Backend.Services;
using QuizBuzz.Backend.DTOs;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2;


namespace QuizBuzz.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionController : ControllerBase
    {
        private readonly ISessionService _sessionService;
        private readonly ILogger<SessionController> _logger;
        private readonly IHubContext<SessionHub> _hubContext;

        public SessionController(ISessionService sessionService, ILogger<SessionController> logger, IHubContext<SessionHub> hubContext)
        {
            _sessionService = sessionService ?? throw new ArgumentNullException(nameof(sessionService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _hubContext = hubContext ?? throw new ArgumentNullException(nameof(hubContext));
        }

        [HttpPost]
        public async Task<IActionResult> SaveSessionAsync([FromBody] Session newSession)
        {
            try
            {
                string sessionId = await _sessionService.SubmitSessionAsync(newSession);
                _logger.LogInformation($"Session saved successfully. Session ID: {sessionId}");

                return Ok(sessionId);

            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error saving session: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{sessionId}", Name = "GetSessionById")]
        public async Task<IActionResult> GetSessionByIdAsync([FromRoute] string sessionId)
        {
            try
            {
                Session? session = await _sessionService.FetchSessionAsync(sessionId);
                if (session == null)
                {
                    _logger.LogInformation($"no sessions foud for id : {sessionId}");
                    
                    return NotFound();
                }
                _logger.LogInformation($"found session : {sessionId} with name : {session.Name}");
                
                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{sessionId}")]
        public async Task<IActionResult> DeleteSessionAsync([FromRoute] string sessionId)
        {
            try
            {
                _logger.LogInformation($"Deleting session with ID: {sessionId}");
                await _sessionService.DeleteSessionAsync(sessionId);
                _logger.LogInformation($"Session deleted successfully. Session ID: {sessionId}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete]
        public async Task<IActionResult> DeleteSessionsAsync([FromBody] List<string> sessionIds)
        {
            if (sessionIds == null || !sessionIds.Any())
            {
                _logger.LogInformation($"sessionIds list is null or empty");

                return BadRequest("Session IDs cannot be null or empty.");
            }

            try
            {
                await _sessionService.DeleteSessionsAsync(sessionIds);
                _logger.LogInformation($"Sessions deleted successfully: {string.Join(", ", sessionIds)}");
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting sessions: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpGet("{sessionId}/participants", Name = "GetSessionParticipants")]
        public async Task<IActionResult> GetSessionParticipants([FromRoute] string sessionId)
        {
            try
            {
                var participants = await _sessionService.GetSessionParticipantsAsync(sessionId);
                if (participants == null)
                {
                    return NotFound();
                }
                _logger.LogInformation($"found {participants.Count()} participants ");
                return Ok(participants);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching students for session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{sessionId}/join")]
        public async Task<IActionResult> JoinSession([FromRoute] string sessionId, [FromBody] string nickname)
        {
            try
            {
                // Validate the session and user
                _logger.LogInformation($"user {nickname} want to join session {sessionId}");
                Session? session = await _sessionService.FetchSessionAsync(sessionId);
                if (session == null)
                {
                    Debug.WriteLine($"didnt found any session with id {sessionId}");
                    return NotFound("Session not found");
                }
                _logger.LogInformation("found session, want to add user now ");
                // Add user to session (update session object or add to participants list)
                await _sessionService.JoinSession(sessionId, nickname);
                
                return Ok("User joined session successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error joining session {sessionId}: {ex.Message}");
                return BadRequest($"Error joining session: {ex.Message}");
            }
        }


        [HttpGet("by-date-status")]
        public async Task<IActionResult> GetSessionsByDateAndStatus([FromQuery] string? sessionStatus, [FromQuery] string? startDate, [FromQuery] string? endDate)
        {
            try
            {
                _logger.LogInformation($"Fetching sessions with status {sessionStatus} from {startDate} to {endDate}");

                var sessions = await _sessionService.FetchByDateAndStatusAsync(sessionStatus, startDate, endDate);
                if (sessions == null || !sessions.Any())
                {
                    _logger.LogInformation($"No sessions found with status {sessionStatus} between {startDate} and {endDate}");
                    return NotFound($"No sessions found with status {sessionStatus} between {startDate} and {endDate}");
                }

                _logger.LogInformation($"Found {sessions.Count()} sessions with status {sessionStatus} between {startDate} and {endDate}");

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching sessions with status {sessionStatus} between {startDate} and {endDate}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


       /* [HttpGet("by-status/{sessionStatus}")]
        public async Task<IActionResult> GetSessionsByStatus([FromRoute] string sessionStatus)
        {

            try
            {
                _logger.LogInformation($"Fetching sessions with status : {sessionStatus}");

                var sessions = await _sessionService.GetSessionsByStatusAsync(sessionStatus);
                if (sessions == null || !sessions.Any())
                {
                    _logger.LogInformation($"No sessions found with status {sessionStatus}");
                    return NotFound($"No sessions found with status {sessionStatus}");
                }
                _logger.LogInformation($"found ${sessions.Count()} sessions ");

                _logger.LogInformation($"Successfully retrieved sessions with status {sessionStatus}.");

                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"An error occurred while retrieving sessions with status {sessionStatus}.");
                return StatusCode(500, $"An error occurred while retrieving sessions with status {sessionStatus}.");
            }
        }

*/

        [HttpGet("all/{userId}")]
        public async Task<IActionResult> GetSessionsByUserId(string userId)
        {
            try
            {
                var sessions = await _sessionService.GetSessionsByHostId(userId);
                if (sessions == null || !sessions.Any())
                {
                    _logger.LogInformation($"No sessions found for the user {userId}");
                    return NotFound($"No sessions found for the user {userId}");
                }
                _logger.LogInformation($"found ${sessions.Count()} sessions ");
             
                return Ok(sessions);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching sessions for user {userId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{sessionId}/start")]
        public async Task<IActionResult> StartSession(string sessionId)
        {
            try
            {
                await _sessionService.StartSession(sessionId);
                _logger.LogInformation($"Session {sessionId} started successfully");

                return Ok($"Session {sessionId} started successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error starting session {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPost("submit-answer")]
        public async Task<IActionResult> SubmitAnswer([FromBody] AnswerSubmissionDto answerSubmission)
        {
            try
            {
                if (answerSubmission == null)
                {
                    return BadRequest("Answer submission object is required");
                }

                // Extract sessionId and nickname from the DTO
                string sessionId = answerSubmission.SessionId;
                string nickname = answerSubmission.Nickname;

                _logger.LogInformation($"Session ID: {sessionId}, Nickname: {nickname} \nAnswer submission: {JsonConvert.SerializeObject(answerSubmission)}");

                // Save the question response to the database
                bool isCorrect = await _sessionService.SubmitUserAnswerAsync(answerSubmission);
                _logger.LogInformation("Saved question response successfully!");

                return Ok("Question response submitted successfully");
            }
            catch (Exception ex)
            {
                // Log the error and return a 500 Internal Server Error response
                // You can customize the error message based on the specific exception if needed
                _logger.LogError($"Error: {ex.Message}");

                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [HttpGet("{sessionId}/results")]
        public async Task<IActionResult> GetSessionResults(string sessionId)
        {
            try
            {
                _logger.LogInformation($"Fetching session results for session with ID: {sessionId}");

                var sessionResult = await _sessionService.FetchSessionResultsAsync(sessionId);
                Debug.WriteLine($"sessionResult: {sessionResult.ToString()}");

                return Ok(sessionResult);
            }
            catch (Exception ex)
            {
                // Handle any errors or exceptions
                _logger.LogError($"Error fetching session results for session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{sessionId}/responses")]
        public async Task<IActionResult> GetSessionResponses(string sessionId)
        {
            try
            {
                _logger.LogInformation($"Fetching responses for session with ID: {sessionId}");

                var sessionResponses = await _sessionService.GetSessionResponsesAsync(sessionId);
                Debug.WriteLine($"Fetched {sessionResponses.Count()} responses");

                return Ok(sessionResponses);
            }
            catch (Exception ex)
            {
                // Handle any errors or exceptions
                _logger.LogError($"Error fetching responses for session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



    }
}
    
