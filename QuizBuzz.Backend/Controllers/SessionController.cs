using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;
using Newtonsoft.Json;
using Amazon.Runtime.Internal.Util;
using QuizBuzz.Backend.Models.DTO;


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
        public async Task<IActionResult> CreateSessionAsync([FromBody] Session newSession)
        {
            try
            {
                Debug.WriteLine("Creating session");
                newSession.SessionID = Guid.NewGuid().ToString(); // Generate a unique ID for the session
                Debug.WriteLine($"Generated SessionID: {newSession.SessionID}");
                await _sessionService.CreateSessionAsync(newSession);
                Debug.WriteLine($"saved session with sessionId: {newSession.SessionID} successfully");

                return CreatedAtAction(nameof(GetSessionById), new { sessionId = newSession.SessionID }, newSession);
            }
            catch (Exception ex)
            {
                Debug.WriteLine("error in Creating session");

                _logger.LogError(ex, $"Error creating session: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{sessionId}", Name = "GetSessionById")]
        public async Task<IActionResult> GetSessionById(string sessionId)
        {
            try
            {
                Debug.WriteLine($"get session by sessionid : {sessionId}");

                Session? session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    Debug.WriteLine($"no sessions foud for id : {sessionId}");

                    return NotFound();
                }
                Debug.WriteLine($"found session : {sessionId} with name : {session.Name}");
                
                return Ok(session);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{sessionId}")]
        public async Task<IActionResult> DeleteSessionAsync(string sessionId)
        {
            try
            {
                await _sessionService.DeleteSessionAsync(sessionId);
                return NoContent();
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error deleting session with ID {sessionId}: {ex.Message}");
                _logger.LogError(ex, $"Error deleting session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{sessionId}/participants", Name = "GetSessionParticipants")]
        public async Task<IActionResult> GetSessionParticipants(string sessionId)
        {
            try
            {
                Debug.WriteLine($" get session participants:");
                var participants = await _sessionService.GetSessionParticipantsAsync(sessionId);
                if (participants == null)
                {
                    Debug.WriteLine("no participants yet!");
                    return NotFound();
                }
                Debug.WriteLine($"found {participants.Count()} participants ");
                return Ok(participants);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching students for session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{sessionId}/join")]
        public async Task<IActionResult> JoinSession(string sessionId, [FromBody] string nickname)
        {
            try
            {
                // Validate the session and user
                Debug.WriteLine($"user {nickname} want to join session {sessionId}");
                Session? session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    Debug.WriteLine($"didnt found any session with id {sessionId}");
                    return NotFound("Session not found");
                }
                Debug.WriteLine("found session, want to add user now ");
                // Add user to session (update session object or add to participants list)
                await _sessionService.AddUserToSessionAsync(sessionId, nickname);
                
                return Ok("User joined session successfully");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Error joining session {sessionId}: {ex.Message}");
                _logger.LogError(ex, $"Error joining session {sessionId}: {ex.Message}");
                return BadRequest($"Error joining session: {ex.Message}");
            }
        }

        [HttpGet("all/{userId}")]
        public async Task<IActionResult> GetSessionsByUserId(string userId)
        {
            Debug.WriteLine("GetSessionsByUserId:");
            try
            {
                var sessions = await _sessionService.GetSessionsByUserIdAsync(userId);
                if (sessions == null || !sessions.Any())
                {
                    Console.WriteLine("No sessions!:");
                    return NotFound("No sessions found for the user");
                }
                Console.WriteLine("Sessions:");
                foreach (var session in sessions)
                {
                    Console.WriteLine($"Session ID: {session.SessionID}");
                    // Add more properties if needed
                }
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
                Debug.WriteLine("Fetching the session from the database...");
                // Fetch the session from the database
                Session? session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    Debug.WriteLine("Session not found in the database.");
                    return NotFound("Session not found");
                }

                Debug.WriteLine($"Session found. Checking if the session has already started...");
                // Check if the session has already started
                if (session.StartedAt < DateTime.UtcNow)
                {
                    Debug.WriteLine($"Session has already started at {session.StartedAt} and current time is {DateTime.UtcNow}");
                    return Conflict("Session has already started");
                }

                Debug.WriteLine("Updating the startedAt field with the current datetime...");
                // Update the startedAt field with the current datetime
                session.StartedAt = DateTime.UtcNow;

                Debug.WriteLine("Saving the updated session in the database...");
                // Save the updated session in the database
                await _sessionService.UpdateSessionAsync(session);
                // Notify clients about the submitted question response
                return Ok("Session started successfully");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while starting session {sessionId}: {ex.Message}");
                _logger.LogError(ex, $"Error starting session {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        [HttpPost("submit-answer")]
        public async Task<IActionResult> SubmitAnswer([FromBody] AnswerSubmissionDto answerSubmission)
        {
            try
            {
                Debug.WriteLine("In submit answer!");

                // Check if the answerSubmission object is null
                if (answerSubmission == null)
                {
                    return BadRequest("Answer submission object is required");
                }

                // Extract sessionId and nickname from the DTO
                string sessionId = answerSubmission.SessionId;
                string nickname = answerSubmission.Nickname;

                // Check if the sessionId is provided
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    return BadRequest("Session ID is required");
                }

                // Check if the nickname is provided
                if (string.IsNullOrWhiteSpace(nickname))
                {
                    return BadRequest("Nickname is required");
                }

                Debug.WriteLine($"Session ID: {sessionId}, Nickname: {nickname} \nAnswer submission: {JsonConvert.SerializeObject(answerSubmission)}");

                // Perform additional validation as needed
                // For example, check if sessionId, nickname, QuestionIndex, and QuestionResponse are provided

                // Validate other fields as needed

                // Save the question response to the database
                bool isCorrect = await _sessionService.SaveQuestionResponseAsync(answerSubmission);
                Debug.WriteLine("Saved question response successfully!");

                // Notify clients about the submitted question response
                

                return Ok("Question response submitted successfully");
            }
            catch (Exception ex)
            {
                // Log the error and return a 500 Internal Server Error response
                // You can customize the error message based on the specific exception if needed
                Debug.WriteLine($"Error: {ex.Message}");

                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [HttpGet("{sessionId}/results")]
        public async Task<IActionResult> GetSessionResults(string sessionId)
        {
            try
            {
                Debug.WriteLine($"Fetching session results for session with ID: {sessionId}");

                var sessionResult = await _sessionService.GetSessionResultsAsync(sessionId);
                Debug.WriteLine($"sessionResult: {sessionResult.ToString()}");

                return Ok(sessionResult);
            }
            catch (Exception ex)
            {
                // Handle any errors or exceptions
                Debug.WriteLine($"Error fetching session results for session with ID {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }




    }
}
    
