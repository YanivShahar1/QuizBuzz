using Amazon.DynamoDBv2.DataModel;
using System;

namespace QuizBuzz.Backend.Models
{

    [DynamoDBTable("Sessions")]
    public class Session
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        public string AssociatedQuizID { get; set; } = string.Empty;
        public string SessionCode { get; set; } = string.Empty;
        public DateTime StartedAt { get; set; } = DateTime.UtcNow;
        public DateTime EndedAt { get; set; } = DateTime.MinValue; //  default value
    }

}

