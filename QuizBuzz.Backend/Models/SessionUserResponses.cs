using Amazon.DynamoDBv2.DataModel;
using System.Collections.Generic;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("PlayerResponses")]
    public class SessionUserResponses
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        [DynamoDBRangeKey]
        public string Nickname { get; set; } = string.Empty;

        // Dictionary to store responses for each question index
        // Key: Question index
        // Value: Response data for the corresponding question index
        public Dictionary<int, QuestionResponse> ResponsesByQuestion { get; set; } = new Dictionary<int, QuestionResponse>();
    }

    // Class to represent response data for each question index
    public class QuestionResponse
    {
        // List of selected options for the question
        public List<int> SelectedOptions { get; set; } = new List<int>();

        // List of time taken for the question
        public List<long> TimeTaken { get; set; } = new List<long>();
    }
}
