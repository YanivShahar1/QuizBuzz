using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.DataModel;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;

namespace QuizBuzz.Backend.Models
{
    [DynamoDBTable("PlayerResponses")]
    public class UserResponses
    {
        [DynamoDBHashKey]
        public string SessionID { get; set; } = string.Empty;

        [DynamoDBRangeKey]
        public string Nickname { get; set; } = string.Empty;

        // Define a custom converter for ResponsesByQuestion
        [DynamoDBProperty(typeof(Converters.DictionaryResponseConverter))] // Specify the type of converter
        public Dictionary<int, Response> ResponsesByQuestion { get; set; } = new Dictionary<int, Response>();
    }

    // Class to represent response data for each question index
    public class Response
    {
        public List<int> SelectedOptions { get; set; } = new List<int>();

        public long TimeTaken { get; set; }

        public bool IsCorrect { get; set; }
    }

    
}
