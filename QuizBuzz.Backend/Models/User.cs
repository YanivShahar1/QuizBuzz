using Amazon.DynamoDBv2.DataModel;
using System;

namespace QuizBuzz.Backend.Models

{
    [DynamoDBTable("Users")]
    public class User
    {
        [DynamoDBHashKey]
        public int UserId { get; set; }

        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public List<string> QuizIds { get; set; } = new List<string>();
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Additional properties as needed...
    }
}
