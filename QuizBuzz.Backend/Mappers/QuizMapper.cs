using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.DTOs;
using System.Linq;

namespace QuizBuzz.Backend.Mappers
{
    public static class QuizMapper
    {
        public static QuizDto ToDto(this Quiz quiz)
        {
            return new QuizDto
            {
                QuizID = quiz.QuizID,
                HostUserID = quiz.HostUserID,
                Title = quiz.Title,
                Description = quiz.Description,
                Category = quiz.Category,
                CreatedAt = quiz.CreatedAt,
                UpdatedAt = quiz.UpdatedAt,
                Questions = quiz.Questions.Select(q => q.ToDto()).ToList()
            };
        }

        public static QuestionDto ToDto(this Question question)
        {
            return new QuestionDto
            {
                QuestionText = question.QuestionText,
                Options = question.Options,
                IsMultipleAnswerAllowed = question.IsMultipleAnswerAllowed
            };
        }
    }
}
