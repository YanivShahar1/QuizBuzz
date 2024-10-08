﻿using QuizBuzz.Backend.DTOs;
using QuizBuzz.Backend.Models;

namespace QuizBuzz.Backend.Services
{
    public interface IQuizService
    {
        Task<Quiz> FetchQuizAsync(string quizId);
        Task<List<QuizDto>> GetAllQuizzesAsync();
        Task<string> SubmitQuizAsync(Quiz newQuiz);
        Task DeleteQuizAsync(string quizId);

        Task DeleteQuizzesAsync(List<string> quizIds);

        List<string> GetCategories();

        Task<IEnumerable<Quiz>> GetQuizzesByHostUserIdAsync(string userId);

        Task<IEnumerable<Question>> GetQuestionsAsync(string quizId);

        bool SuggestCategory(string category);
        void RemoveCorrectAnswers(Quiz quiz);


    }
}
