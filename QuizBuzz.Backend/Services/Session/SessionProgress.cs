namespace QuizBuzz.Backend.Services
{
    public class SessionProgress
    {
        private readonly object _lock = new object();
        
        private readonly int _numParticipants ;
        
        private int _currrQuestionIndex = 0;
        private int _numOfAnswersForCurrentQuestion = 0;

        public SessionProgress(int numParticipants)
        {
            _numParticipants = numParticipants;
                
        }
        public int QuestionIndex
        {
            get
            {
                lock (_lock)
                {
                    return _currrQuestionIndex;
                }
            }
        }

        public void IncrementNumOfAnswersForCurrentQuestion()
        {
            lock (_lock)
            {
                _numOfAnswersForCurrentQuestion++;

                if (_numOfAnswersForCurrentQuestion == _numParticipants)
                {
                    //All participants answered, go to next question
                    _currrQuestionIndex++;
                    _numOfAnswersForCurrentQuestion = 0;


                }
            }
        }

        public void ResetNumOfAnswers()
        {
            lock (_lock)
            {
                _numOfAnswersForCurrentQuestion = 0;
            }
        }

        public void IncrementQuestionIndex()
        {
            lock (_lock)
            {
                _currrQuestionIndex++;
            }
        }

        public void ResetQuestionIndex()
        {
            lock (_lock)
            {
                _currrQuestionIndex = 0;
            }
        }

        
    }

}

