﻿using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Models;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;

namespace QuizBuzz.Backend.Services
{
    public class SessionService : ISessionService
    {
        private const string HostUserIDIndexName = "HostUserID-index";
        private const string HostUserIDAttributeName = "HostUserID";

        private readonly IMemoryCache _cache;
        private readonly IDynamoDBDataManager _dynamoDBDataManager;
        private readonly ILogger<SessionService> _logger;

        public SessionService(IMemoryCache cache, IDynamoDBDataManager dynamoDBDataManager, ILogger<SessionService> logger)
        {
            _cache = cache ?? throw new ArgumentNullException(nameof(cache));
            _dynamoDBDataManager = dynamoDBDataManager ?? throw new ArgumentNullException(nameof(dynamoDBDataManager));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<string> CreateSessionAsync(Session newSession)
        {
            ArgumentNullException.ThrowIfNull(newSession);
            Debug.WriteLine($"Creating session: {newSession}");

            newSession.SessionID = Guid.NewGuid().ToString(); // Generate a unique ID for the session
            Debug.WriteLine($"Generated SessionID: {newSession.SessionID}");

            // Additional validation or business logic if needed
            await _dynamoDBDataManager.SaveItemAsync(newSession);
            Debug.WriteLine($"Saved {newSession.SessionID} in DynamoDB database");

            // Invalidate the cache to reflect the new data
            Debug.WriteLine($"Removed AllSessions from cache");
            _cache.Remove("AllSessions");

            _logger.LogInformation("New session saved to database. Cache invalidated.");

            return newSession.SessionID;
        }

        public async Task<Session?> GetSessionByIdAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            Debug.WriteLine($"Fetching session with ID: {sessionId}");

            // Check if the session exists in the cache
            string cacheKey = $"Session_{sessionId}";
            if (_cache.TryGetValue(cacheKey, out Session? cachedSession))
            {
                Debug.WriteLine($"Session with ID {sessionId} found in cache.");

                _logger.LogInformation($"Session with ID {sessionId} found in cache.");
                return cachedSession!;
            }
            _logger.LogInformation($"Session with ID {sessionId} not found in cache. Fetching from database.");
            Debug.WriteLine($"Session with ID {sessionId} not found in cache. Fetching from database.");

            // If not found in cache, fetch it from the database
            Session session = await _dynamoDBDataManager.GetItemAsync<Session>(sessionId);

            // Cache the fetched session
            if (session != null)
            {
                var cacheOptions = new MemoryCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10), // Cache for 10 minutes
                    Priority = CacheItemPriority.High
                };
                _cache.Set(cacheKey, session, cacheOptions);

                _logger.LogInformation($"Session with ID {sessionId} fetched from database and cached.");
            }
            else
            {
                _logger.LogInformation($"Session with ID {sessionId} not found in database.");
            }

            return session;
        }

        public async Task DeleteSessionAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            Debug.WriteLine($"Deleting session with ID: {sessionId}");

            await _dynamoDBDataManager.DeleteItemAsync<Session>(sessionId);

            // Invalidate the cache after deletion
            _cache.Remove("AllSessions");
            _cache.Remove($"Session_{sessionId}");
            Debug.WriteLine($"removed AllSessions and : Session_{sessionId} from cache");

            _logger.LogInformation($"Session with ID {sessionId} deleted from database. Cache invalidated.");
        }

        public async Task<IEnumerable<Session>> GetSessionsByHostUserIdAsync(string hostUserId)
        {
            if (string.IsNullOrEmpty(hostUserId))
            {
                throw new ArgumentException("Host user ID cannot be null or empty.", nameof(hostUserId));
            }

            Debug.WriteLine($"Getting sessions for host user with ID: {hostUserId}");

            return await _dynamoDBDataManager.QueryItemsByIndexAsync<Session>(HostUserIDIndexName, HostUserIDAttributeName, hostUserId);
        }

        public async Task<IEnumerable<string>> GetSessionParticipantsAsync(string sessionId)
        {
            if (string.IsNullOrEmpty(sessionId))
            {
                throw new ArgumentException("Session ID cannot be null or empty.", nameof(sessionId));
            }

            Debug.WriteLine($"Fetching participants for session with ID: {sessionId}");

            // Fetch the session from the database
            Session session = await _dynamoDBDataManager.GetItemAsync<Session>(sessionId);

            if (session != null)
            {
                return session.Participants;
            }
            else
            {
                // Session not found
                return new List<string>();
            }
        }
    }
}
