using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Models.DTO;
using static System.Collections.Specialized.BitVector32;

namespace QuizBuzz.Backend.Services.Managers
{
    public class SessionManager
    {

        // Dictionary to store the current question index for each session
        private Dictionary<string, int> sessionCurrentQuestionIndices;

        public SessionManager()
        {
            sessionCurrentQuestionIndices = new Dictionary<string, int>();
        }

        public void InitializeSessionWithId(Session newSession)
        {
           newSession.SessionID = Guid.NewGuid().ToString(); // Generate a unique ID for the session
        }

        public void AddParticipantToSession(Session session, string nickname)
        {
            if (string.IsNullOrEmpty(nickname))
            {
                throw new ArgumentException("User Nickname cannot be null or empty.", nameof(nickname));
            }
            // Add the user to the session if it doesn't already exist
            if (!session.Participants.Contains(nickname))
            {
                session.Participants.Add(nickname);
            }
            else
            {
                throw new ArgumentException($"Nickname {nickname} already exists in the session.");
            }
        }


        public Response CreateQuestionResponse(AnswerSubmissionDto answerSubmission, Quiz quiz)
        {
            string nickname = answerSubmission.Nickname;
            int questionIndex = answerSubmission.QuestionIndex;
            List<int> selectedOptions = answerSubmission.SelectedOptions;
            long timeTaken = answerSubmission.TimeTaken;

            // Perform validation on the received data


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

            bool isCorrect = calculateIsCorrect(quiz.Questions[questionIndex].CorrectOptions, selectedOptions);
            int numQuestions = quiz.Questions.Count();

            // Create the response object
            Response response = new Response
            {
                SelectedOptions = selectedOptions,
                TimeTaken = timeTaken,
                IsCorrect = isCorrect
            };

            return response;
        }

        public UserResponses AddUserResponse(UserResponses? currentUserResponses, Response newResponse,AnswerSubmissionDto answerSubmission ){
            // Create or retrieve the SessionUserResponses object for the given session ID and nickname
            UserResponses updatedResponses;
            if (currentUserResponses == null)
            {
                // If the SessionUserResponses object doesn't exist, create a new one
                updatedResponses = new UserResponses
                {
                    SessionID = answerSubmission.SessionId,
                    Nickname = answerSubmission.Nickname,
                };
                Debug.WriteLine($"sessionUserResponses was null, now: : {JsonConvert.SerializeObject(updatedResponses)}");
            }
            else if (currentUserResponses.ResponsesByQuestion.ContainsKey(answerSubmission.QuestionIndex))
            {
                throw new InvalidOperationException($"Nickname '{answerSubmission.Nickname}' has already answered question at index {answerSubmission.QuestionIndex}");
            }
            else
            {
                updatedResponses = currentUserResponses;
            }
            // Save or update the QuestionResponse object at the specified question index
            updatedResponses.ResponsesByQuestion.Add(answerSubmission.QuestionIndex, newResponse);

            return updatedResponses;

        }
        private bool calculateIsCorrect(List<int> correctOptions, List<int> userSelectedOptions)
        {
            // Check if both lists have the same elements, regardless of their order
            bool res = correctOptions.OrderBy(o => o).SequenceEqual(userSelectedOptions.OrderBy(o => o));
            Debug.WriteLine($"in calculateIsCorrect, result: {res}");

            return res;
        }


        public void FinishSession(Session session)
        {
            if (session.EndedAt <= DateTime.Now)
            {
                // Session is already finished, so no need to finish it again
                Debug.WriteLine($"Session with ID {session.SessionID} is already finished, the time is {session.EndedAt}.");
                return;
            }

            // Update the session end time
            session.EndedAt = DateTime.UtcNow;
        }

        // Method to get the current question index for a session
        public int GetCurrentQuestionIndex(string sessionId)
        {
            if (sessionCurrentQuestionIndices.ContainsKey(sessionId))
            {
                return sessionCurrentQuestionIndices[sessionId];
            }
            else
            {
                // If session ID not found, return a default value (e.g., -1)
                return -1;
            }
        }

        // Method to set the current question index for a session
        public void SetCurrentQuestionIndex(string sessionId, int currentIndex)
        {
            sessionCurrentQuestionIndices[sessionId] = currentIndex;
        }

        public SessionResult CreateSessionResult(Session session, Dictionary<string, UserResponses> participantsResponses, Quiz quiz)
        {
            // Create a new SessionResult object
            SessionResult sessionResult = new SessionResult
            {
                SessionID = session.SessionID,
                ParticipantResults = new List<ParticipantResult>()
            };

            
            foreach (var (participant, responses) in participantsResponses)
            {

                ParticipantResult participantResult = createParticipantResult(responses, quiz );
                sessionResult.ParticipantResults.Add(participantResult);
            }

            return sessionResult;
        }

        private ParticipantResult createParticipantResult(UserResponses sessionUserResponses, Quiz quiz)
        {
            ParticipantResult result = new ParticipantResult();

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
                        if (response.IsCorrect)
                        {
                            totalCorrectAnswers++;
                        }

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

    }
}
