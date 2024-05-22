using Amazon.DynamoDBv2.Model;

namespace QuizBuzz.Backend.DataAccess
{
    /// <summary>
    /// Interface for managing interactions with DynamoDB.
    /// </summary>
    public interface IDynamoDBManager
    {
        /// <summary>
        /// Retrieves all items of a specified type from DynamoDB asynchronously.
        /// </summary>
        /// <typeparam name="T">The type of items to retrieve.</typeparam>
        /// <returns>A collection of items.</returns>
        Task<IEnumerable<T>> GetAllItemsAsync<T>();

        /// <summary>
        /// Saves an item to DynamoDB asynchronously.
        /// </summary>
        /// <typeparam name="T">The type of the item to save.</typeparam>
        /// <param name="item">The item to save.</param>
        Task SaveItemAsync<T>(T item);

        /// <summary>
        /// Retrieves an item from DynamoDB asynchronously using the provided hash key.
        /// </summary>
        /// <typeparam name="T">The type of item to retrieve.</typeparam>
        /// <param name="hashKey">The hash key of the item.</param>
        /// <returns>The retrieved item.</returns>
        Task<T> GetItemAsync<T>(object hashKey);

        /// <summary>
        /// Retrieves an item from DynamoDB asynchronously using the provided hash key and range key.
        /// </summary>
        /// <typeparam name="T">The type of item to retrieve.</typeparam>
        /// <param name="hashKey">The hash key of the item.</param>
        /// <param name="rangeKey">The range key of the item.</param>
        /// <returns>The retrieved item.</returns>
        Task<T> GetItemAsync<T>(object hashKey, object rangeKey);

        /// <summary>
        /// Deletes an item from DynamoDB asynchronously using the provided hash key.
        /// </summary>
        /// <typeparam name="T">The type of item to delete.</typeparam>
        /// <param name="hashKey">The hash key of the item to delete.</param>
        Task DeleteItemAsync<T>(object hashKey);

        /// <summary>
        /// Checks if an item exists in DynamoDB asynchronously.
        /// </summary>
        /// <typeparam name="T">The type of item to check.</typeparam>
        /// <param name="idAttributeName">The name of the attribute representing the ID in DynamoDB.</param>
        /// <param name="idValue">The value of the ID to check.</param>
        /// <returns>True if the item exists, otherwise false.</returns>
        Task<bool> ItemExistsAsync<T>(string idAttributeName, string idValue);

        /// <summary>
        /// Queries items in the DynamoDB table using the specified Global Secondary Index (GSI).
        /// </summary>
        /// <typeparam name="T">The type of items to query.</typeparam>
        /// <param name="indexName">The name of the Global Secondary Index (GSI) to use for querying.</param>
        /// <param name="partitionKey">The name of the partition key attribute for the index.</param>
        /// <param name="partitionValue">The value of the partition key to query.</param>
        /// <returns>A collection of items matching the query criteria.</returns>
        Task<IEnumerable<T>> QueryItemsByIndexAsync<T>(string indexName, string partitionKey, string partitionValue) where T : class;

        /// <summary>
        /// Queries items in the DynamoDB table using the specified hash and range keys.
        /// </summary>
        /// <typeparam name="T">The type of items to query.</typeparam>
        /// <param name="hashKey">The name of the hash key attribute.</param>
        /// <param name="rangeKey">The name of the range key attribute.</param>
        /// <param name="hashKeyValue">The value of the hash key.</param>
        /// <param name="rangeKeyValue">The value of the range key.</param>
        /// <returns>A collection of items matching the query criteria.</returns>
        Task<IEnumerable<T>> QueryItemsByKeysAsync<T>(string hashKey, string rangeKey, string hashKeyValue, string rangeKeyValue) where T : class;

        /// <summary>
        /// Performs a batch write operation on DynamoDB asynchronously.
        /// This method allows multiple put and delete operations in a single request.
        /// </summary>
        /// <param name="requestItems">A dictionary where the key is the table name and the value is a list of write requests.</param>
        Task BatchWriteItemAsync(Dictionary<string, List<WriteRequest>> requestItems);
    
    }
}
