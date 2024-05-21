using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Formatters;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Models.DTO;
using static System.Collections.Specialized.BitVector32;

namespace QuizBuzz.Backend.Services
{
    public class SessionManager
    {
        private Dictionary<string, SessionProgress> _runningSessionsProgressById;

        public SessionManager()
        {
            _runningSessionsProgressById = new Dictionary<string, SessionProgress>();
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
            List<string> selectedOptions = answerSubmission.SelectedOptions;
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

            bool isCorrect = isCorrectAnswer(quiz.Questions[questionIndex].CorrectOptions, selectedOptions);
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

        public UserResponses AddUserResponse(UserResponses? userResponses, Response newResponse, AnswerSubmissionDto answerSubmission)
        {
            if (userResponses == null)
            {
                // If the SessionUserResponses object doesn't exist, create a new one
                userResponses = new UserResponses
                {
                    SessionID = answerSubmission.SessionId,
                    Nickname = answerSubmission.Nickname,
                };
                Debug.WriteLine($"sessionUserResponses was null, now: : {JsonConvert.SerializeObject(userResponses)}");
            }
            else if (userResponses.ResponsesByQuestion.ContainsKey(answerSubmission.QuestionIndex))
            {
                throw new InvalidOperationException($"User '{answerSubmission.Nickname}' has already answered question at index {answerSubmission.QuestionIndex}");
            }

            userResponses.ResponsesByQuestion.Add(answerSubmission.QuestionIndex, newResponse);
            if (_runningSessionsProgressById.TryGetValue(answerSubmission.SessionId, out SessionProgress? sessionProgress))
            {
                sessionProgress.IncrementNumOfAnswersForCurrentQuestion();
            }
            else
            {
                throw new InvalidOperationException($"Session {answerSubmission.SessionId} didn't start yet");


            }

            return userResponses;

        }

        private bool isCorrectAnswer(List<string> correctOptions, List<string> userOptions)
        {
            if (correctOptions == null || userOptions == null)
            {
                Debug.WriteLine("One or both option lists are null.");
                return false;
            }

            var correctOptionsSet = new HashSet<string>(correctOptions);
            var userSelectedOptionsSet = new HashSet<string>(userOptions);

            bool isCorrect = correctOptionsSet.SetEquals(userSelectedOptionsSet);
            Debug.WriteLine($"in CalculateIsCorrect, result: {isCorrect}");

            return isCorrect;
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

        public void StartSession(Session session)
        {
            if (session.StartedAt < DateTime.UtcNow)
            {
                throw new InvalidOperationException($"Session has already started at {session.StartedAt} and current time is {DateTime.UtcNow}");

            }
            session.StartedAt = DateTime.UtcNow;

            // create new session
            int numParticipants = session.Participants.Count;
            SessionProgress sessionProgress = new SessionProgress(numParticipants);
            _runningSessionsProgressById.Add(session.SessionID, sessionProgress);
        }

        // Method to get the current question index for a session
        public int GetCurrentQuestionIndex(string sessionId)
        {
            if (_runningSessionsProgressById.TryGetValue(sessionId, out var sessionProgress))
            {
                return sessionProgress.QuestionIndex;
            }
            else
            {
                throw new InvalidOperationException($"Session with ID '{sessionId}' has not started yet.");
            }

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

                ParticipantResult participantResult = createParticipantResult(responses, quiz);
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

        public bool HasQuestionIndexChanged(string sessionId, int oldQuestionIndex)
        {
            if ( _runningSessionsProgressById.TryGetValue(sessionId, out SessionProgress? sessionProgress))
            {
                return oldQuestionIndex != sessionProgress.QuestionIndex;

            }
            else
            {
                throw new KeyNotFoundException(sessionId);
            }
        }
    }
}
