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

        // Add any additional fields or metrics you want to track for the session results
    }

    public class ParticipantResult
    {
        public string Nickname { get; set; } = string.Empty;
        public int NumCorrectAnswers { get; set; } = 0;
        public double AverageResponseTime { get; set; } = 0.0;

        // Scoring weights (default values)
        private readonly double weightForCorrectAnswers = 0.7;
        private readonly double weightForResponseTime = 0.3;

        // Score property to hold the calculated score
        public double Score => calculateScore();

        // Method to calculate the score based on NumCorrectAnswers and AverageResponseTime
        private double calculateScore()
        {
            Debug.WriteLine("execute calculateScore");
            // Validate input values
            if (NumCorrectAnswers < 0 || AverageResponseTime < 0)
            {
                throw new ArgumentException("NumCorrectAnswers and AverageResponseTime must be non-negative");
            }

            // Calculate the score based on the weights and values of NumCorrectAnswers and AverageResponseTime
            double score = (NumCorrectAnswers * weightForCorrectAnswers) + (AverageResponseTime * weightForResponseTime);
            Debug.WriteLine($"score = {score}");

            return score;
        }

        // Add any other metrics you want to track for each participant
    }
}
