using System.Threading.Tasks;
using QuizBuzz.Backend.Models; // Assuming Session and Quiz classes are in this namespace

namespace QuizBuzz.Backend.Services.Interfaces
{
    public interface ICacheService<T>
    {
        T? GetItem(string key);
        void CacheItem(string key, T item);
    }
}
