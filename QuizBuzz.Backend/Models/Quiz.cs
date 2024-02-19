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
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public List<Question> Questions { get; set; } = new List<Question>();

        // Category should be replace to Enum later.
        public string Category { get; set; } = string.Empty;

    }

}

