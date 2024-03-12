using Amazon.DynamoDBv2.DataModel;
using System.ComponentModel.DataAnnotations;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("PlayerResponses")]
    public class UserResponse
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;
        public int QuestionIndex { get; set; } = -1;

        [DynamoDBRangeKey]
        public string Nickname { get; set; } = string.Empty;

        public List<int> SelectedOptions { get; set; } = new List<int>(); 
        public bool IsCorrect { get; set; }
    }
}
