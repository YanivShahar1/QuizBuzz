using Amazon.DynamoDBv2.DataModel;
using System.ComponentModel.DataAnnotations;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("PlayerResponses")]
    public class UserResponse
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        [DynamoDBRangeKey]
        public string Nickname { get; set; } = string.Empty;

        public int QuestionIndex { get; set; } = -1;

        // Dictionary to store selected options for each question index
        // Key: Question index
        // Value: List of selected options for the corresponding question index
        public Dictionary<int, List<int>> SelectedOptionsByQuestion { get; set; } = new Dictionary<int, List<int>>();

        public bool IsCorrect { get; set; }

        public long TimeTakenToAnswerMilliseconds { get; set; }
    }
}
