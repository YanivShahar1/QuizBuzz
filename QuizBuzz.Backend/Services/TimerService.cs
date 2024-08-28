using System;
using System.Threading;

namespace QuizBuzz.Backend.Services
{
    public class TimerService : IDisposable
    {
        private Timer? _timer;
        private readonly Action _onElapsed;
        private readonly TimeSpan _interval;

        public TimerService(TimeSpan interval, Action onElapsed)
        {
            _interval = interval != default ? interval : throw new ArgumentNullException(nameof(interval));
            _onElapsed = onElapsed ?? throw new ArgumentNullException(nameof(onElapsed));
        }

        public void Start()
        {
            _timer = new Timer(OnElapsedHandler, null, _interval, _interval);
        }

        public void Stop()
        {
            _timer?.Change(Timeout.Infinite, 0);
        }

        private void OnElapsedHandler(object? state)
        {
            _onElapsed.Invoke();
        }

        public void Dispose()
        {
            _timer?.Dispose();
        }
    }
}
