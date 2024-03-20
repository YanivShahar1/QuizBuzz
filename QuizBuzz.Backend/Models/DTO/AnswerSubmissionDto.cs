namespace QuizBuzz.Backend.Models.DTO
{
    public class AnswerSubmissionDto
    {
        public string SessionId { get; set; } = String.Empty;
        public string Nickname { get; set; } = String.Empty;
        public int QuestionIndex { get; set; } = -1;

        // The `required` modifier ensures that this property must be initialized
        public required QuestionResponse QuestionResponse { get; set; }
    }
}
