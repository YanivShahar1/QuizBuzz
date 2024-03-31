using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace QuizBuzz.Backend.Models.Converters
{
    // Converter for dictionary serialization and deserialization
    public class DictionaryResponseConverter : IPropertyConverter
    {
        public DynamoDBEntry ToEntry(object value)
        {
            // Convert the value to a dictionary of type <int, Response>
            var dictionary = value as Dictionary<int, Response>;
            if (dictionary == null)
            {
                throw new ArgumentException("Invalid dictionary");
            }

            // Serialize the dictionary to JSON string
            var jsonString = JsonConvert.SerializeObject(dictionary);

            // Log the serialized JSON string
            Debug.WriteLine($"Serialized JSON string: {jsonString}");

            // Return a DynamoDB Primitive entry containing the JSON string
            return new Primitive(jsonString);
        }

        public object FromEntry(DynamoDBEntry? entry)
        {
            // Check if the entry is null or not of type Primitive or not a string
            if (entry == null || !(entry is Primitive primitive) || !(primitive.Value is string))
            {
                throw new ArgumentException("Invalid DynamoDBEntry");
            }

            // Get the JSON string from the Primitive entry
            var jsonString = primitive.AsString();

            // Log the received JSON string
            Debug.WriteLine($"Received JSON string: {jsonString}");

            // Deserialize the JSON string to a dictionary of type <int, Response>
            var dictionary = JsonConvert.DeserializeObject<Dictionary<int, Response>>(jsonString);

            // If deserialization returns null, return a new empty dictionary
            return dictionary ?? new Dictionary<int, Response>();
        }
    }
}
