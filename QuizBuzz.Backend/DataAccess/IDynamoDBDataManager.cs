using Amazon.DynamoDBv2.Model;

namespace QuizBuzz.Backend.DataAccess
{
    public interface IDynamoDBDataManager
    {
        Task<IEnumerable<T>> GetAllItemsAsync<T>();
        
        Task SaveItemAsync<T>(T item);
        
        Task<T> GetItemAsync<T>(object hashKey);
        
        Task DeleteItemAsync<T>(object hashKey);
        
        Task<bool> ItemExistsAsync<T>(string v, string quizId);

        /// <summary>
        /// Queries items in the DynamoDB table using the specified Global Secondary Index (GSI).
        /// </summary>
        /// <typeparam name="T">The type of items to query.</typeparam>
        /// <param name="indexName">The name of the Global Secondary Index (GSI) to use for querying.</param>
        /// <param name="partitionKey">The name of the partition key attribute for the index.</param>
        /// <param name="partitionValue">The value of the partition key to query.</param>
        /// <returns>A collection of items matching the query criteria.</returns>
        Task<IEnumerable<T>> QueryItemsByIndexAsync<T>(string indexName, string partitionKey, string partitionValue) where T : class;
    }
}
