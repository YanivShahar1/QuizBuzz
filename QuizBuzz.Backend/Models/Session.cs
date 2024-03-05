using Amazon.DynamoDBv2.DataModel;
using System;

namespace QuizBuzz.Backend.Models
{

    [DynamoDBTable("Sessions")]
    public class Session
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;

        public string HostUserID { get; set; } = string.Empty;
        public string AssociatedQuizID { get; set; } = string.Empty;
        public string SessionCode { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime StartedAt { get; set; } = DateTime.MaxValue;
        public DateTime EndedAt { get; set; } = DateTime.MaxValue;

        public HashSet<string> Participants { get; set; } = new HashSet<string>();
        public int MaxTimePerQuestion { get; set; }

        public int MaxParticipants { get; set; }
    }
}

