namespace QuizBuzz.Backend.Models.DTO
{
    public class AnswerSubmissionDto
    {
        public string SessionId { get; set; } = String.Empty;
        
        public string Nickname { get; set; } = String.Empty;
       
        public int QuestionIndex { get; set; } = -1;

        public List<int> SelectedOptions { get; set; } = new List<int>();

        public long TimeTaken { get; set; }
    }
}
