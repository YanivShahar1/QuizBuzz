using Amazon.DynamoDBv2.DataModel;
using System;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("Quizzes")]
    public class Quiz
    {
        [DynamoDBHashKey]
        public string QuizID { get; set; } = string.Empty;

        public string HostUserID { get; set; } = string.Empty;
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
        public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
        public List<Question> Questions { get; set; } = new List<Question>();

        public string Category { get; set; } = string.Empty;

    }

}

