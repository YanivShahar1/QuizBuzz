using System;
using System.ComponentModel;

namespace QuizBuzz.Backend.Enums
{
    public static class EnumExtensions
    {
        public static string GetDescription(this Enum value)
        {
            var field = value.GetType().GetField(value.ToString());
            if (field == null)
            {
                // Handle the case where the field is null
                // You can return a default value or throw an exception
                return "Unknown"; // Example: Return a default value
            }
            var attribute = (DescriptionAttribute?)Attribute.GetCustomAttribute(field, typeof(DescriptionAttribute));
            return attribute?.Description ?? value.ToString();
        }
    }
}
