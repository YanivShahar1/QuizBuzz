using Amazon.DynamoDBv2.DataModel;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("SessionResults")]
    public class SessionResult
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        public DateTime SessionEndTime { get; set; } = DateTime.UtcNow;

        public List<ParticipantResult> ParticipantResults { get; set; } = new List<ParticipantResult>();

        // Add any additional fields or metrics you want to track for the session results
    }

    public class ParticipantResult
    {
        public string Nickname { get; set; } = string.Empty;
        public int NumCorrectAnswers { get; set; }
        public double AverageResponseTime { get; set; }
        // Add any other metrics you want to track for each participant
    }
}
