using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.Model;
using System.Collections.Generic;
using Amazon.DynamoDBv2.DocumentModel;
using System.Diagnostics;

namespace QuizBuzz.Backend.DataAccess
{
    public class DynamoDBDataManager : IDynamoDBDataManager
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly IDynamoDBContext _dbContext;

        public DynamoDBDataManager(IAmazonDynamoDB dynamoDBClient)
        {
            _dynamoDbClient = dynamoDBClient;
            _dbContext = new DynamoDBContext(_dynamoDbClient);
        }

        public async Task<IEnumerable<T>> GetAllItemsAsync<T>()
        {
            return await _dbContext.ScanAsync<T>(new List<ScanCondition>()).GetRemainingAsync();
        }

        public async Task SaveItemAsync<T>(T item)
        {
            await _dbContext.SaveAsync(item);
        }

        public async Task<T> GetItemAsync<T>(object hashKey)
        {
            try
            {
                // Perform the database operation to load the item
                //_logger.LogInformation($"Fetching item of type '{typeof(T).Name}' with hash key '{hashKey}'");
                var item = await _dbContext.LoadAsync<T>(hashKey);

                // Log success
                //_logger.LogInformation($"Item of type '{typeof(T).Name}' fetched successfully");

                return item;
            }
            catch (Exception ex)
            {
                // Log error
                //_logger.LogError(ex, $"Error fetching item of type '{typeof(T).Name}' with hash key '{hashKey}'");

                // Propagate the exception to the caller
                throw;
            }
        }

        public async Task<T> GetItemAsync<T>(object hashKey, object rangeKey)
        {
            try
            {
                // Perform the database operation to load the item
                var item = await _dbContext.LoadAsync<T>(hashKey, rangeKey);

                // Log success
                //_logger.LogInformation($"Item of type '{typeof(T).Name}' fetched successfully");

                return item;
            }
            catch (Exception ex)
            {
                // Log error
                //_logger.LogError(ex, $"Error fetching item of type '{typeof(T).Name}' with hash key '{hashKey}' and range key '{rangeKey}'");

                // Propagate the exception to the caller
                throw;
            }
        }


        public async Task DeleteItemAsync<T>(object hashKey)
        {
            await _dbContext.DeleteAsync<T>(hashKey);
        }


      
        public async Task<IEnumerable<T>> QueryItemsByIndexAsync<T>(string indexName, string partitionKey, string partitionValue) where T : class
        {
            // Perform a query operation using the specified GSI and partition key value
            var query = _dbContext.QueryAsync<T>(partitionValue, new DynamoDBOperationConfig
            {
                IndexName = indexName
            });

            // Retrieve the next set of items asynchronously
            return await query.GetNextSetAsync();
        }

        public async Task<IEnumerable<T>> QueryItemsByKeysAsync<T>(string hashKey, string rangeKey, string hashKeyValue, string rangeKeyValue) where T : class
        {
            // Perform a query operation using the specified hash and range keys
            var query = _dbContext.QueryAsync<T>(new List<ScanCondition>
                            {
                                new ScanCondition(hashKey, ScanOperator.Equal, hashKeyValue),
                                new ScanCondition(rangeKey, ScanOperator.Equal, rangeKeyValue)
                            });

            // Retrieve the next set of items asynchronously
            return await query.GetNextSetAsync();
        }



        public async Task<bool> ItemExistsAsync<T>(string idAttributeName, string idValue)
        {
            try
            {
                var tableName = typeof(T).Name;
                Console.WriteLine($"Checking existence in DynamoDB table: {tableName}, ID: {idValue}");

                var queryRequest = new QueryRequest
                {
                    TableName = tableName,
                    KeyConditionExpression = $"{idAttributeName} = :idValue",
                    ExpressionAttributeValues = new Dictionary<string, AttributeValue>
                    {
                        { ":idValue", new AttributeValue { S = idValue } }
                    }
                };

                var queryResponse = await _dynamoDbClient.QueryAsync(queryRequest);

                // Check if any items match the query
                bool itemExists = queryResponse.Items.Count > 0;
                Console.WriteLine($"Item exists in DynamoDB table: {itemExists}");

                return itemExists;
            }
            catch (AmazonDynamoDBException ex)
            {
                Console.Error.WriteLine($"DynamoDB Exception: {ex.Message}");
                throw; // Re-throw the exception to signal an error to the caller
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"An unexpected error occurred: {ex.Message}");
                throw; // Re-throw the exception to signal an error to the caller
            }
        }
    }
}