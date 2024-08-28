using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.DynamoDBv2.DocumentModel;
using Amazon.DynamoDBv2.Model;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Text;

namespace QuizBuzz.Backend.DataAccess
{
    public class DynamoDBManager : IDynamoDBManager
    {
        private readonly IAmazonDynamoDB _dynamoDbClient;
        private readonly IDynamoDBContext _dbContext;
        private readonly ILogger<DynamoDBManager> _logger;

        public DynamoDBManager(IAmazonDynamoDB dynamoDBClient, ILogger<DynamoDBManager> logger)
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
                var queryConfig = new DynamoDBOperationConfig
                {
                    IndexName = indexName
                };

                var queryOperation = _dbContext.QueryAsync<T>(partitionValue, queryConfig);
                var queryResult = await queryOperation.GetNextSetAsync();

                return queryResult;
            }
            catch (AmazonDynamoDBException ex)
            {
                var errorMessage = $"Error querying items of type '{typeof(T).Name}' by index '{indexName}' with partition key '{partitionKey}' and value '{partitionValue}' from DynamoDB";

                _logger.LogError(ex, errorMessage);
                throw;
            }
            catch (Exception ex)
            {
                var errorMessage = $"An unexpected error occurred while querying items of type '{typeof(T).Name}' by index '{indexName}' with partition key '{partitionKey}' and value '{partitionValue}' from DynamoDB";

                _logger.LogError(ex, errorMessage);
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

        public async Task BatchWriteItemAsync(Dictionary<string, List<WriteRequest>> requestItems)
        {
            try
            {
                var request = new BatchWriteItemRequest
                {
                    RequestItems = requestItems
                };

                var response = await _dynamoDbClient.BatchWriteItemAsync(request);

                if (response.UnprocessedItems.Count > 0)
                {
                    _logger.LogWarning("Some items were not processed. Retrying...");
                    await retryUnprocessedItemsAsync(response.UnprocessedItems);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error performing batch write operation");
                throw;
            }
        }


        private async Task retryUnprocessedItemsAsync(Dictionary<string, List<WriteRequest>> unprocessedItems)
        {
            // Retry logic for unprocessed items
            // Implement exponential backoff or other retry strategies as needed
            int retryCount = 0;
            int maxRetries = 5;
            while (unprocessedItems.Count > 0 && retryCount < maxRetries)
            {
                await Task.Delay(1000 * (int)Math.Pow(2, retryCount)); // Exponential backoff
                var response = await _dynamoDbClient.BatchWriteItemAsync(new BatchWriteItemRequest { RequestItems = unprocessedItems });
                unprocessedItems = response.UnprocessedItems;
                retryCount++;
            }

            if (unprocessedItems.Count > 0)
            {
                _logger.LogError("Some items could not be processed after multiple retries.");
            }
        }


        public async Task<(IEnumerable<T> Items, Dictionary<string, AttributeValue> LastEvaluatedKey)> ScanItemsAsync<T>(
                            List<ScanCondition>? conditions = null,
                            int limit = 100,
                            Dictionary<string, AttributeValue>? lastEvaluatedKey = null)
                            where T : class
        {
            try
            {
                // Handle null conditions and initialize default values
                conditions ??= new List<ScanCondition>();
                lastEvaluatedKey ??= new Dictionary<string, AttributeValue>();

                var (filterExpression, expressionAttributeValues) = BuildFilterExpression(conditions);

                var scanRequest = new ScanRequest
                {
                    TableName = typeof(T).Name,
                    FilterExpression = filterExpression,
                    ExpressionAttributeValues = expressionAttributeValues.Count > 0 ? expressionAttributeValues : null,
                    ExclusiveStartKey = lastEvaluatedKey.Count > 0 ? lastEvaluatedKey : null,
                    Limit = limit
                };

                var response = await _dynamoDbClient.ScanAsync(scanRequest);

                // Convert response items to List<T>
                var items = new List<T>();
                foreach (var item in response.Items)
                {
                    var deserializedItem = Document.FromAttributeMap(item);
                    var itemObject = _dbContext.FromDocument<T>(deserializedItem);
                    items.Add(itemObject);
                }

                // Ensure LastEvaluatedKey is non-null
                var lastKey = response.LastEvaluatedKey ?? new Dictionary<string, AttributeValue>();

                _logger.LogInformation($"Scanned items of type '{typeof(T).Name}' successfully with limit {limit}");

                return (items, lastKey);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error scanning items of type '{typeof(T).Name}' from DynamoDB");
                throw;
            }
        }

        private (string FilterExpression, Dictionary<string, AttributeValue> ExpressionAttributeValues) BuildFilterExpression(List<ScanCondition> conditions)
        {
            var expression = new StringBuilder();
            var attributeValues = new Dictionary<string, AttributeValue>();

            foreach (var condition in conditions)
            {
                var attributeName = condition.PropertyName;
                var placeholder = $":{attributeName}";
                expression.Append($"{attributeName} {GetDynamoDBOperator(condition.Operator)} {placeholder} AND ");

                // Handle different value types
                var value = condition.Values.FirstOrDefault();
                if (value != null)
                {
                    attributeValues.Add(placeholder, ConvertToAttributeValue(value));
                }
            }

            if (expression.Length > 0)
                expression.Length -= 5; // Remove the trailing " AND "

            return (expression.ToString(), attributeValues);
        }

        private string GetDynamoDBOperator(ScanOperator scanOperator)
        {
            return scanOperator switch
            {
                ScanOperator.Equal => "=",
                ScanOperator.NotEqual => "<>",
                ScanOperator.LessThan => "<",
                ScanOperator.LessThanOrEqual => "<=",
                ScanOperator.GreaterThan => ">",
                ScanOperator.GreaterThanOrEqual => ">=",
                ScanOperator.BeginsWith => "begins_with",
                ScanOperator.Contains => "contains",
                _ => throw new NotSupportedException($"Scan operator '{scanOperator}' is not supported")
            };
        }

        public async Task<List<T>> FetchFilteredItemsAsync<T>(
            string tableName,
            string indexName,
            Dictionary<string, AttributeValue> keyConditions,
            Dictionary<string, AttributeValue> attributeValues,
            Func<Dictionary<string, AttributeValue>, T> mapper) where T : class, new()
        {
            _logger.LogInformation($"Fetching FilteredItemsAsync ");

            var queryRequest = new QueryRequest
            {
                TableName = tableName,
                IndexName = indexName
            };

            queryRequest.KeyConditionExpression = string.Join(" and ", keyConditions.Keys);
            queryRequest.ExpressionAttributeValues = attributeValues;
            _logger.LogInformation($"queryRequest : {queryRequest}");
            var queryResponse = await _dynamoDbClient.QueryAsync(queryRequest);
            _logger.LogInformation($"queryResponse : {queryResponse}");


            var items = new List<T>();
            foreach (var item in queryResponse.Items)
            {
                items.Add(mapper(item));
            }

            return items;
        }

        private AttributeValue ConvertToAttributeValue(object value)
        {
            return value switch
            {
                string str => new AttributeValue { S = str },
                int num => new AttributeValue { N = num.ToString() },
                long num => new AttributeValue { N = num.ToString() },
                bool boolValue => new AttributeValue { BOOL = boolValue },
                _ => throw new NotSupportedException($"Value type '{value.GetType()}' is not supported")
            };
        }

        async Task<QueryResponse> IDynamoDBManager.QueryAsync(QueryRequest queryRequest)
        {
            return await _dynamoDbClient.QueryAsync(queryRequest);
        }

        public async Task<AsyncSearch<T>> FromQueryAsync<T>(QueryOperationConfig queryRequest)
        {
            try
            {
                // Execute the query operation with the provided configuration.
                var search = _dbContext.FromQueryAsync<T>(queryRequest);

                // Log the successful execution.
                _logger.LogInformation($"Query executed successfully for type '{typeof(T).Name}' with configuration: {JsonConvert.SerializeObject(queryRequest)}");

                // Return the async search object.
                return await Task.FromResult(search);
            }
            catch (Exception ex)
            {
                // Log the exception in case of failure.
                _logger.LogError(ex, $"Error executing query for type '{typeof(T).Name}' with configuration: {JsonConvert.SerializeObject(queryRequest)}");
                throw;
            }
        }

    }
}
