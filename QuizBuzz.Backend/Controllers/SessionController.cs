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
                // Fetch the session from the database
                Session? session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    return NotFound("Session not found");
                }

                // Check if the session has already started
                if (session.StartedAt < DateTime.UtcNow)
                {
                    Debug.WriteLine($"session started already at {session.StartedAt} and current time is {DateTime.UtcNow}");
                    return Conflict("Session has already started");
                }

                // Update the startedAt field with the current datetime
                session.StartedAt = DateTime.UtcNow;

                // Save the updated session in the database
                await _sessionService.UpdateSessionAsync(session);

                return Ok("Session started successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error starting session {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("{sessionId}/submit-answer")]
        public async Task<IActionResult> SubmitAnswer(string sessionId, [FromBody] UserResponse userResponse)
        {
            // TODO: Implement server-side answer validation and separate correct answers.
            // Update the logic to check answer correctness on the server side.
            // Remove the responsibility from the client and adjust the UserResponse accordingly.

            try
            {

                Debug.WriteLine($"in submit answer ! ");

                // Check if the session ID is provided
                if (string.IsNullOrWhiteSpace(sessionId))
                {
                    return BadRequest("Session ID is required");
                }

                // Check if the userResponse object is null
                if (userResponse == null)
                {
                    return BadRequest("User response object is required");
                }
                Debug.WriteLine($"Session ID: {sessionId} \nUser response: {JsonConvert.SerializeObject(userResponse)}");
                // Perform additional validation as needed
                // For example, check if questionId is provided

                // Validate other fields as needed (e.g., selectedOptions, nickname)

                // Save the user response to the database
                await _sessionService.SaveUserResponseAsync(sessionId, userResponse);
                Debug.WriteLine($"saved user response successfully!");

                // Notify clients about the submitted user response
                await _hubContext.Clients.Group(sessionId).SendAsync("UserResponseSubmitted", userResponse);
                Debug.WriteLine($"sent UserResponseSubmitted ! ");

                return Ok("User response submitted successfully");
            }
            catch (Exception ex)
            {
                // Log the error and return a 500 Internal Server Error response
                // You can customize the error message based on the specific exception if needed
                Debug.WriteLine($"Error: {ex.Message} ");

                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



    }
}
    
