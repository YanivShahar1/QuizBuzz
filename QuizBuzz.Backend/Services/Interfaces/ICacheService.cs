namespace QuizBuzz.Backend.Services.Interfaces
{
    public interface ICacheService<T>
    {
        /// <summary>
        /// Retrieves an item from the cache based on the given item ID.
        /// </summary>
        /// <param name="itemId">The unique identifier of the item.</param>
        /// <returns>The cached item if found; otherwise, null.</returns>
        T? GetItem(string itemId);

        /// <summary>
        /// Caches an item with the specified item ID.
        /// </summary>
        /// <param name="itemId">The unique identifier of the item.</param>
        /// <param name="item">The item to be cached.</param>
        void CacheItem(string itemId, T item);

        /// <summary>
        /// Removes an item from the cache based on the given item ID.
        /// </summary>
        /// <param name="itemId">The unique identifier of the item.</param>
        void RemoveItem(string itemId);

    }
}
