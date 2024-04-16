using Microsoft.AspNetCore.SignalR;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services;
using System;
using System.Diagnostics;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    public class SessionHub : Hub
    {

        private readonly ISessionService _sessionService;

        public SessionHub(ISessionService sessionService)
        {
            _sessionService = sessionService;
        }

        public async Task UserJoined(string sessionId, string userId)
        {
            Debug.WriteLine($"Adding user {userId} to session group {sessionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, sessionId);
            Debug.WriteLine($"User {userId} added to session group {sessionId}");

            Debug.WriteLine($"Sending UserJoined message to session group {sessionId}");
            await Clients.Group(sessionId).SendAsync("UserJoined", userId);
            //await Clients.All.SendAsync("UserJoined", userId);
            Debug.WriteLine($"UserJoined message sent to session group {sessionId}");

            Debug.WriteLine($"User {userId} joined session {sessionId} successfully");
        }


        [HubMethodName("SessionStarted")]
        public async Task SessionStarted(string sessionId)
        {
            try
            {
                Debug.WriteLine($"Sessionhub , session {sessionId} has started");

                // Send the event to clients in the session group
                await Clients.Group(sessionId).SendAsync("SessionStarted");
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while sending SessionStarted notification: {ex.Message}");
            }
        }

        public async Task SendAnswer(string quizId, string questionId, string userId, string answer)
        {
            try
            {
                Debug.WriteLine($"Sending answer '{answer}' from user '{userId}' for question '{questionId}' in quiz '{quizId}'");
                await Clients.All.SendAsync("AnswerReceived", quizId, questionId, userId, answer);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while sending answer: {ex.Message}");
            }
        }

        public async Task SessionFinished(string sessionId)
        {
            try
            {
                // Update session end time using the session service
                await _sessionService.FinishSessionAsync(sessionId);
                Debug.WriteLine($"Session finished: {sessionId}");  
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"An error occurred while ending quiz: {ex.Message}");
            }
        } 
    }
}
