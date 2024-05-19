using Microsoft.AspNetCore.Mvc;
using QuizBuzz.Backend.Models;
using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Amazon.Runtime.Internal.Util;
using QuizBuzz.Backend.DataAccess;
using System.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using QuizBuzz.Backend.Hubs;
using Newtonsoft.Json;
using QuizBuzz.Backend.Enums;
using QuizBuzz.Backend.Services;

namespace QuizBuzz.Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class QuizController : ControllerBase
    {
        private readonly IQuizService _quizService;
        private readonly ILogger<QuizController> _logger;
        private readonly IHubContext<QuizHub> _hubContext;
        public QuizController( ILogger<QuizController> logger, IQuizService quizService, IHubContext<QuizHub> hubContext)
        {
            _quizService = quizService;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _hubContext = hubContext;
        }


        // GET: api/quiz/{quizId}
        [HttpGet("{quizId}", Name = "GetQuizById")]
        public async Task<IActionResult> GetQuizById(string quizId)
        {
            try
            {
                _logger.LogInformation($"Fetching quiz with ID: {quizId}");
                Quiz? quiz = await _quizService.FetchQuizAsync(quizId);

                if (quiz == null)
                {
                    return NotFound(); 
                }

                return Ok(quiz);
            }
            catch (ArgumentException ex)
            {
                _logger.LogWarning(ex, $"Invalid argument while fetching quiz: {ex.Message}");
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching quiz with ID {quizId}: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }

        // GET: api/quiz/categories
        [HttpGet("categories")]
        public IActionResult GetQuizCategories()
        {
            try
            {
                var categories =  _quizService.GetCategories();
                // Print categories to console for debugging
                _logger.LogInformation("Available Quiz Categories:");
                foreach (var category in categories)
                {
                    _logger.LogInformation(category);
                }
                return Ok(categories);
            }
            catch (Exception ex)
            {
                // Log the exception
                _logger.LogError($"An error occurred while getting quiz categories: {ex.Message}");
                // Return an error response
                return StatusCode(500, "An error occurred while fetching quiz categories.");
            }
        }



        // POST: api/Quiz
        [HttpPost]
        public async Task<IActionResult> CreateQuizAsync([FromBody] Quiz newQuiz)
        {
            try
            {
                Debug.WriteLine($"CreateQuizAsync , newQuiz ,: {JsonConvert.SerializeObject(newQuiz)}");

                string quizId = await _quizService.SaveQuizAsync(newQuiz);
                _logger.LogInformation($"Quiz created with ID: {quizId}");

                return CreatedAtAction(nameof(GetQuizById), new { quizId = quizId }, newQuiz);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating quiz: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE: api/Quiz/{quizId}
        [HttpDelete("{quizId}")]
        public async Task<IActionResult> DeleteQuizAsync(string quizId)
        {
            try
            {
                Debug.WriteLine($"DeleteQuizAsync , quizId ,: {quizId}");

                // Call the service to delete the quiz
                await _quizService.DeleteQuizAsync(quizId);

                return NoContent(); // 204 No Content indicates a successful deletion
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message); // 400 Bad Request if quizId is null or empty
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal Server Error: {ex.Message}");
            }
        }

        // GET: api/quiz/all/{userName}
        [HttpGet("all/{userName}")]
        public async Task<IActionResult> GetQuizzesByHostUserIDAsync(string userName)
        {
            try
            {
                Debug.WriteLine($"Controller GetQuizzesByHostUserIDAsync , username ,: {userName}");

                // Call the service to get quizzes by user ID
                var quizzes = await _quizService.GetQuizzesByHostUserIdAsync(userName);
                Debug.WriteLine($"Fetched all quizzes");

                if (quizzes == null || !quizzes.Any())
                {
                    Debug.WriteLine($"No quizzes for user {userName}");

                    // Return 404 Not Found if no quizzes found for the user
                    return NotFound($"No quizzes found for user with userName: {userName}");
                }
                Debug.WriteLine($"found quizzes : {quizzes } for user {userName}");

                return Ok(quizzes);
            }
            catch (ArgumentException ex)
            {
                Debug.WriteLine($"ArgumentException error {ex.Message}");

                // Return 400 Bad Request for invalid user ID
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"Exception error {ex.Message}");

                // Return 500 Internal Server Error for other exceptions
                _logger.LogError(ex, $"Error fetching quizzes for user with ID {userName}: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }


        // Other CRUD operations...
    }
}
