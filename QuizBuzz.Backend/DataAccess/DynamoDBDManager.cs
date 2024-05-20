using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;

namespace QuizBuzz.Backend.DataAccess
{
    public class DynamoDBDManager : IDynamoDBManager
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly IDynamoDBContext _dbContext;
        private readonly ILogger<DynamoDBDManager> _logger;

        public DynamoDBDManager(IAmazonDynamoDB dynamoDBClient, ILogger<DynamoDBDManager> logger)
        {
            _dynamoDbClient = dynamoDBClient ?? throw new ArgumentNullException(nameof(dynamoDBClient));
            _dbContext = new DynamoDBContext(_dynamoDbClient);
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<T>> GetAllItemsAsync<T>()
        {
            try
            {
                return await _dbContext.ScanAsync<T>(new List<ScanCondition>()).GetRemainingAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting all items of type '{typeof(T).Name}' from DynamoDB");
                throw;
            }
        }

        public async Task SaveItemAsync<T>(T item)
        {
            try
            {
                if (item == null)
                {
                    throw new ArgumentNullException(nameof(item), "Item cannot be null");
                }

                await _dbContext.SaveAsync(item);
                _logger.LogInformation($"Item of type '{typeof(T).Name}' saved successfully: {JsonConvert.SerializeObject(item)}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error saving item of type '{typeof(T).Name}' to DynamoDB");
                throw;
            }
        }

        public async Task<T> GetItemAsync<T>(object hashKey)
        {
            try
            {
                var item = await _dbContext.LoadAsync<T>(hashKey);
                _logger.LogInformation($"Item of type '{typeof(T).Name}' fetched successfully: {JsonConvert.SerializeObject(item)}");
                return item;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching item of type '{typeof(T).Name}' with hash key '{hashKey}' from DynamoDB");
                throw;
            }
        }

        public async Task<T> GetItemAsync<T>(object hashKey, object rangeKey)
        {
            try
            {
                var item = await _dbContext.LoadAsync<T>(hashKey, rangeKey);
                _logger.LogInformation($"Item of type '{typeof(T).Name}' fetched successfully: {JsonConvert.SerializeObject(item)}");
                return item;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching item of type '{typeof(T).Name}' with hash key '{hashKey}' and range key '{rangeKey}' from DynamoDB");
                throw;
            }
        }

        public async Task DeleteItemAsync<T>(object hashKey)
        {
            try
            {
                await _dbContext.DeleteAsync<T>(hashKey);
                _logger.LogInformation($"Item of type '{typeof(T).Name}' deleted successfully with hash key '{hashKey}'");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting item of type '{typeof(T).Name}' with hash key '{hashKey}' from DynamoDB");
                throw;
            }
        }

        public async Task<IEnumerable<T>> QueryItemsByIndexAsync<T>(string indexName, string partitionKey, string partitionValue) where T : class
        {
            try
            {
                var query = _dbContext.QueryAsync<T>(partitionValue, new DynamoDBOperationConfig
                {
                    IndexName = indexName
                });

                return await query.GetNextSetAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error querying items of type '{typeof(T).Name}' by index '{indexName}' with partition key '{partitionKey}' and value '{partitionValue}' from DynamoDB");
                throw;
            }
        }

        public async Task<IEnumerable<T>> QueryItemsByKeysAsync<T>(string hashKey, string rangeKey, string hashKeyValue, string rangeKeyValue) where T : class
        {
            try
            {
                var query = _dbContext.QueryAsync<T>(new List<ScanCondition>
                {
                    new ScanCondition(hashKey, ScanOperator.Equal, hashKeyValue),
                    new ScanCondition(rangeKey, ScanOperator.Equal, rangeKeyValue)
                });

                return await query.GetNextSetAsync();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error querying items of type '{typeof(T).Name}' by keys '{hashKey}' and '{rangeKey}' with values '{hashKeyValue}' and '{rangeKeyValue}' from DynamoDB");
                throw;
            }
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

                bool itemExists = queryResponse.Items.Count > 0;
                Console.WriteLine($"Item exists in DynamoDB table: {itemExists}");

                return itemExists;
            }
            catch (AmazonDynamoDBException ex)
            {
                Console.Error.WriteLine($"DynamoDB Exception: {ex.Message}");
                throw;
            }
            catch (Exception ex)
            {
                Console.Error.WriteLine($"An unexpected error occurred: {ex.Message}");
                throw;
            }
        }
    }
}
