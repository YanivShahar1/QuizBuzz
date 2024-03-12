using Microsoft.AspNetCore.SignalR;
using System;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Hubs
{
    /// <summary>
    /// SignalR hub for managing quiz-related notifications.
    /// </summary>
    public class QuizHub : Hub
    {
        /// <summary>
        /// Sends a notification that a quiz has been created.
        /// </summary>
        /// <param name="quizId">The ID of the created quiz.</param>
        /// <param name="username">The username of the user who created the quiz.</param>
        public async Task SendQuizCreatedNotification(string quizId, string username)
        {
            try
            {
                await Clients.All.SendAsync("QuizCreated", quizId, username);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it appropriately
                Console.WriteLine($"An error occurred while sending QuizCreated notification: {ex.Message}");
                // You can choose to rethrow the exception if needed
                // throw;
            }
        }

        /// <summary>
        /// Sends a notification that a quiz has been updated.
        /// </summary>
        /// <param name="quizId">The ID of the updated quiz.</param>
        /// <param name="username">The username of the user who updated the quiz.</param>
        public async Task SendQuizUpdatedNotification(string quizId, string username)
        {
            try
            {
                await Clients.All.SendAsync("QuizUpdated", quizId, username);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it appropriately
                Console.WriteLine($"An error occurred while sending QuizUpdated notification: {ex.Message}");
                // You can choose to rethrow the exception if needed
                // throw;
            }
        }

        /// <summary>
        /// Sends a notification that a quiz has been deleted.
        /// </summary>
        /// <param name="quizId">The ID of the deleted quiz.</param>
        /// <param name="username">The username of the user who deleted the quiz.</param>
        public async Task SendQuizDeletedNotification(string quizId, string username)
        {
            try
            {
                await Clients.All.SendAsync("QuizDeleted", quizId, username);
            }
            catch (Exception ex)
            {
                // Log the exception or handle it appropriately
                Console.WriteLine($"An error occurred while sending QuizDeleted notification: {ex.Message}");
                // You can choose to rethrow the exception if needed
                // throw;
            }
        }


    }
}
