namespace QuizBuzz.Backend.Models.DTO
{
    public class AnswerSubmissionDto
    {
        public string SessionId { get; set; } = String.Empty;
        
        public string Nickname { get; set; } = String.Empty;
       
        public int QuestionIndex { get; set; } = -1;

        public List<string> SelectedOptions { get; set; } = new List<string>();

        public long TimeTaken { get; set; }
    }
}
