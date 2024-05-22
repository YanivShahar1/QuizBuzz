namespace QuizBuzz.Backend.DTOs
{
    public class QuestionDto
    {
        public string QuestionText { get; set; } = string.Empty;
        public List<string> Options { get; set; } = new List<string>();
        public bool IsMultipleAnswerAllowed { get; set; }
    }
}
