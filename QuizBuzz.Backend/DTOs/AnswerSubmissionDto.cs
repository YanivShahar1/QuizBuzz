namespace QuizBuzz.Backend.DTOs
{
    public class AnswerSubmissionDto
    {
        public string SessionId { get; set; } = string.Empty;

        public string Nickname { get; set; } = string.Empty;

        public int QuestionIndex { get; set; } = -1;

        public List<string> SelectedOptions { get; set; } = new List<string>();

        public long TimeTaken { get; set; }
    }
}
