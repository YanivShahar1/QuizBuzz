using Amazon.DynamoDBv2.DataModel;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("PlayerResponses")]
    public class PlayerResponse
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        [DynamoDBRangeKey]
        public int UserID { get; set; } // UserID is an int for sequential IDs

        public string QuestionID { get; set; } = string.Empty;
        public int SelectedOption { get; set; } = -1; 
        public bool IsCorrect { get; set; }
    }
}
