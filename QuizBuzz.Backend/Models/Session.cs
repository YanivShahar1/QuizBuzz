using Amazon.DynamoDBv2.DataModel;
using QuizBuzz.Backend.Enums;
using System;

namespace QuizBuzz.Backend.Models
{

    [DynamoDBTable("Sessions")]
    public class Session
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        [DynamoDBGlobalSecondaryIndexHashKey("HostUserID_Index")]
        public string HostUserID { get; set; } = string.Empty;

        [DynamoDBGlobalSecondaryIndexHashKey("SessionStatus-CreatedAt-index")]
        public string SessionStatus { get; set; } = eSessionStatus.Waiting.ToString();

        [DynamoDBGlobalSecondaryIndexRangeKey("SessionStatus-CreatedAt-index")]
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");

        public string Name { get; set; } = string.Empty;

        public string Description { get; set; } = string.Empty;


        public string AssociatedQuizID { get; set; } = string.Empty;
        public string SessionCode { get; set; } = string.Empty;

        public string StartedAt { get; set; } = DateTime.MaxValue.ToString("yyyy-MM-ddTHH:mm:ssZ");
        public string EndedAt { get; set; } = DateTime.MaxValue.ToString("yyyy-MM-ddTHH:mm:ssZ");

        public HashSet<string> Participants { get; set; } = new HashSet<string>();
        public int MaxTimePerQuestion { get; set; }
        public int MaxParticipants { get; set; }
    }
}

