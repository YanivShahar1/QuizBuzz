using Amazon.DynamoDBv2.DataModel;
using System;

namespace QuizBuzz.Backend.Models
{


    [DynamoDBTable("QuizResults")]
    public class Result
    {
        [DynamoDBHashKey]
        public string ResultId { get; set; } = string.Empty;

        public string UserId { get; set; } = string.Empty; // User associated with the result
        public string QuizId { get; set; } = string.Empty; // Quiz associated with the result
        public int Score { get; set; } // Score achieved in the quiz
        public bool IsCompleted { get; set; } // Indicates if the quiz was completed
        public DateTime StartedAt { get; set; } = DateTime.UtcNow; // Timestamp for when the quiz started (initialized to current UTC time)
        public DateTime EndedAt { get; set; } // Timestamp for when the quiz ended (can be initialized later)
                                              // Other relevant properties as needed...
    }
}

