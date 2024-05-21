using Amazon.DynamoDBv2.DataModel;
using System.Collections.Generic;

namespace QuizBuzz.Backend.Models
{
    public class Question
    {
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new List<string>();
        public List<string> CorrectOptions { get; set; } = new List<string>();
        public bool IsMultipleAnswerAllowed { get; set; }
    }
}
