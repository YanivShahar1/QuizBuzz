namespace QuizBuzz.Backend.DTOs
{
    public class QuizDto
    {
        public string HostUserID { get; set; } = string.Empty;

        public string QuizID { get; set; } = "";
        public string Title { get; set; } = "";
        public string Description { get; set; } = "";
        public string Category { get; set; } = "";
        public string CreatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
        public string UpdatedAt { get; set; } = DateTime.UtcNow.ToString("yyyy-MM-ddTHH:mm:ssZ");
        public List<QuestionDto> Questions { get; set; } = new List<QuestionDto>();
    }
}
