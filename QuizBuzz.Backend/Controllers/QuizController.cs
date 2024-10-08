﻿using Microsoft.AspNetCore.Mvc;
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
using QuizBuzz.Backend.DTOs;
using QuizBuzz.Backend.Mappers;

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
                QuizDto quizDto = quiz.ToDto();

                return Ok(quizDto);
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

        [HttpGet("all")]
        public async Task<IActionResult> GetAllQuizzesAsync()
        {
            try
            {
                _logger.LogInformation("Fetching all quizzes");
                var quizzes = await _quizService.GetAllQuizzesAsync();

                if (quizzes == null || !quizzes.Any())
                {
                    return NotFound("No quizzes found.");
                }
                _logger.LogInformation($"Found {quizzes.Count} quizzes");


                return Ok(quizzes);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching all quizzes");
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
                _logger.LogInformation($"{categories.Count} Quiz Categories found");
               
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

                string quizId = await _quizService.SubmitQuizAsync(newQuiz);
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
                _logger.LogInformation($"DeleteQuizAsync , quizId ,: {quizId}");

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

        [HttpDelete]
        public async Task<IActionResult> DeleteQuizzesAsync([FromBody] List<string> quizIds)
        {
            _logger.LogInformation($"Received request to delete quizzes with IDs: {string.Join(", ", quizIds ?? new List<string>())}");
            if (quizIds == null || !quizIds.Any())
            {
                _logger.LogError($"Received request to delete quizzes without ids");

                return BadRequest("Session IDs cannot be null or empty.");
            }
            _logger.LogInformation($"step 2 want to delete quizzes : {JsonConvert.SerializeObject(quizIds)}");


            try
            {
                await _quizService.DeleteQuizzesAsync(quizIds);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting sessions: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
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
                _logger.LogInformation($"Fetched all quizzes");

                if (quizzes == null || !quizzes.Any())
                {
                    _logger.LogInformation($"No quizzes for user {userName}");

                    // Return 404 Not Found if no quizzes found for the user
                    return NotFound($"No quizzes found for user with userName: {userName}");
                }
                _logger.LogInformation($"found quizzes : {quizzes } for user {userName}");

                return Ok(quizzes);
            }
            catch (ArgumentException ex)
            {
                _logger.LogError($"ArgumentException error {ex.Message}");

                // Return 400 Bad Request for invalid user ID
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {

                // Return 500 Internal Server Error for other exceptions
                _logger.LogError(ex, $"Error fetching quizzes for user with ID {userName}: {ex.Message}");
                return StatusCode(500, "Internal server error");
            }
        }


        // POST: api/quiz/category
        [HttpPost("category")]
        public IActionResult SuggestCategory(string category)
        {
            _logger.LogInformation($"SuggestCategory");


            try
            {
                _logger.LogInformation($"category su = {category}");
                if(string.IsNullOrEmpty(category))
                {
                    return BadRequest("Category cannot be empty.");
                }
                _logger.LogInformation($"category su = {category}");


                // Call the service to handle the suggestion
                bool suggestionResult = _quizService.SuggestCategory(category);
                _logger.LogInformation($"suggestionResult = {suggestionResult}");
                if (suggestionResult)
                {
                    // If the suggestion was successful, return a success response
                    return Ok("Category suggestion received and saved successfully.");
                }
                else
                {
                    // If the suggestion failed, return an appropriate error response
                    return StatusCode(500, "Failed to save category suggestion.");
                }
            }
            catch (Exception ex)
            {
                // Log the exception
                _logger.LogError($"An error occurred while processing category suggestion: {ex.Message}");
                // Return an error response
                return StatusCode(500, "An error occurred while processing category suggestion.");
            }
        }

    }
}
