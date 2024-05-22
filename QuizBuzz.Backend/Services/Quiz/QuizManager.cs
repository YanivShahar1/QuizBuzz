using System;
using System.Collections.Generic;
using System.Diagnostics;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using QuizBuzz.Backend.Models;

namespace QuizBuzz.Backend.Services
{
    public class QuizManager
    {
        public void InitializeQuizWithId(Quiz newQuiz)
        {
            newQuiz.QuizID = Guid.NewGuid().ToString(); // Generate a unique ID for the quiz
        }

    }
}
