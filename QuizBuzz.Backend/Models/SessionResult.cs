using Amazon.DynamoDBv2.DataModel;
using System.Diagnostics;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("SessionResults")]
    public class SessionResult
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        public List<ParticipantResult> ParticipantResults { get; set; } = new List<ParticipantResult>();

    }

    public class ParticipantResult
    {
        public string Nickname { get; set; } = string.Empty;
        public int NumCorrectAnswers { get; set; } = 0;
        public double AverageResponseTime { get; set; } = 0.0;


        // Add any other metrics you want to track for each participant
    }
}
