using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.Hubs;
using Microsoft.AspNetCore.SignalR;
using System.Diagnostics;

namespace QuizBuzz.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SessionController : ControllerBase
    {
        private readonly ISessionService _sessionService;
        private readonly ISessionHub _sessionHub;
        private readonly ILogger<SessionController> _logger;

        public SessionController(ISessionService sessionService, ILogger<SessionController> logger, ISessionHub sessionHub)
        {
            _sessionService = sessionService ?? throw new ArgumentNullException(nameof(sessionService));
            _sessionHub = sessionHub ?? throw new ArgumentNullException(nameof(sessionHub));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        [HttpPost]
        public async Task<IActionResult> CreateSessionAsync([FromBody] Session newSession)
        {
            try
            {
                Debug.WriteLine("Creating session"); 
                string sessionId = await _sessionService.CreateSessionAsync(newSession);
                Debug.WriteLine($"sessionId: {sessionId}");

                return CreatedAtAction(nameof(GetSessionById), new { sessionId = sessionId }, newSession);
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

        [HttpGet("{sessionId}/students", Name = "GetSessionStudents")]
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
        public async Task<IActionResult> JoinSession(string sessionId, [FromBody] string userId)
        {
            try
            {
                // Validate the session and user
                Debug.WriteLine($"user {userId} want to join session {sessionId}");
                Session? session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    Debug.WriteLine($"didnt found any session with id {sessionId}");
                    return NotFound("Session not found");
                }
                Debug.WriteLine("found session, want to add user now ");
                // Add user to session (update session object or add to participants list)
                await _sessionService.AddUserToSessionAsync(sessionId, userId);

                await _sessionHub.SendUserJoinedNotification(sessionId, userId);

                return Ok("User joined session successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error joining session {sessionId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
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




        // Other CRUD operations...
    }
}
