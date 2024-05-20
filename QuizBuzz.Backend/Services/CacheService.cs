using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.Services.Interfaces;
using System;

namespace QuizBuzz.Backend.Services
{
    public class CacheService<T> : ICacheService<T>
    {
        private readonly IMemoryCache _cache;
        private readonly ILogger<CacheService<T>> _logger;

        public CacheService(IMemoryCache cache, ILogger<CacheService<T>> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public T? GetItem(string itemId)
        {
            ValidateItemId(itemId);

            string cacheKey = GetCacheKey(itemId);
            if (_cache.TryGetValue(cacheKey, out T? cachedItem))
            {
                _logger.LogInformation($"{typeof(T).Name} with ID {itemId} found in cache.");
                return cachedItem;
            }
            else
            {
                _logger.LogInformation($"{typeof(T).Name} with ID {itemId} not found in cache.");
                return default;
            }
        }

        public void CacheItem(string itemId, T item)
        {
            ValidateItemId(itemId);

            string cacheKey = GetCacheKey(itemId);
            var cacheOptions = new MemoryCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                Priority = CacheItemPriority.High
            };
            _cache.Set(cacheKey, item, cacheOptions);

            _logger.LogInformation($"{typeof(T).Name} with ID {itemId} cached successfully.");
        }

        public void RemoveItem(string itemId)
        {
            ValidateItemId(itemId);

            string cacheKey = GetCacheKey(itemId);
            _cache.Remove(cacheKey);

            _logger.LogInformation($"{typeof(T).Name} with ID {itemId} removed from cache.");
        }

        private void ValidateItemId(string itemId)
        {
            if (string.IsNullOrEmpty(itemId))
            {
                throw new ArgumentException($"{typeof(T).Name} ID cannot be null or empty.", nameof(itemId));
            }
        }

        private string GetCacheKey(string itemId)
        {
            return $"{typeof(T).Name}_{itemId}";
        }
    }
}
