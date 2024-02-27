﻿using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.Hubs;
using Microsoft.AspNetCore.SignalR;

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
                string sessionId = await _sessionService.CreateSessionAsync(newSession);
                return CreatedAtAction(nameof(GetSessionById), new { sessionId = sessionId }, newSession);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating session: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{sessionId}", Name = "GetSessionById")]
        public async Task<IActionResult> GetSessionById(string sessionId)
        {
            try
            {
                Session? session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    return NotFound();
                }
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
                var participants = await _sessionService.GetSessionParticipantsAsync(sessionId);
                if (participants == null)
                {
                    return NotFound();
                }
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
                Session? session = await _sessionService.GetSessionByIdAsync(sessionId);
                if (session == null)
                {
                    return NotFound("Session not found");
                }

                // Add user to session (update session object or add to participants list)
                await _sessionService.AddUserToSessionAsync(sessionId, userId);

                // Optionally, send a notification to other users
                await _sessionHub.SendSessionUpdatedNotification(sessionId, userId);

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
            try
            {
                var sessions = await _sessionService.GetSessionsByUserIdAsync(userId);
                if (sessions == null || !sessions.Any())
                {
                    return NotFound("No sessions found for the user");
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
