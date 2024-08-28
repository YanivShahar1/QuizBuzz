using Amazon.DynamoDBv2.Model;
using QuizBuzz.Backend.Enums;
using QuizBuzz.Backend.Models;
using System;
using System.Collections.Generic;

namespace QuizBuzz.Backend.Mappers
{
    public static class DynamoDBMapper
    {
        public static Session MapToSession(Dictionary<string, AttributeValue> item)
        {
            return new Session
            {
                SessionID = item.GetValueOrDefault("SessionID")?.S ?? string.Empty,
                HostUserID = item.GetValueOrDefault("HostUserID")?.S ?? string.Empty,
                CreatedAt = item.GetValueOrDefault("CreatedAt")?.S ?? DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                SessionStatus = item.GetValueOrDefault("Status")?.S ?? eSessionStatus.Waiting.ToString(),
                Name = item.GetValueOrDefault("Name")?.S ?? string.Empty,
                Description = item.GetValueOrDefault("Description")?.S ?? string.Empty,
                AssociatedQuizID = item.GetValueOrDefault("AssociatedQuizID")?.S ?? string.Empty,
                SessionCode = item.GetValueOrDefault("SessionCode")?.S ?? string.Empty,
                StartedAt = item.GetValueOrDefault("StartedAt")?.S ?? DateTime.MaxValue.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                EndedAt = item.GetValueOrDefault("EndedAt")?.S ?? DateTime.MaxValue.ToString("yyyy-MM-ddTHH:mm:ssZ"),
                Participants = item.GetValueOrDefault("Participants")?.SS != null
                    ? new HashSet<string>(item["Participants"].SS)
                    : new HashSet<string>(),
                MaxTimePerQuestion = item.GetValueOrDefault("MaxTimePerQuestion")?.N != null
                    ? int.Parse(item["MaxTimePerQuestion"].N)
                    : 0,
                MaxParticipants = item.GetValueOrDefault("MaxParticipants")?.N != null
                    ? int.Parse(item["MaxParticipants"].N)
                    : 0
            };
        }

        private static AttributeValue? GetValueOrDefault(this Dictionary<string, AttributeValue> dict, string key)
        {
            return dict.ContainsKey(key) ? dict[key] : null;
        }
    }

}
