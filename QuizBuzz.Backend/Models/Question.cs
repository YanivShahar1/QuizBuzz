using Amazon.DynamoDBv2.DataModel;
using System.Collections.Generic;

namespace QuizBuzz.Backend.Models
{
    public class Question
    {
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new List<string>();
        public List<int> CorrectOptions { get; set; } = new List<int>();
        public bool IsMultipleAnswerAllowed { get; set; }
    }
}
