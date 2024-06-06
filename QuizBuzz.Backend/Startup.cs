using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Microsoft.Extensions.Caching.Memory;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Hubs;
using QuizBuzz.Backend.Models;
using QuizBuzz.Backend.Services;
using QuizBuzz.Backend.Services.Interfaces;

namespace QuizBuzz.Backend
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowSpecificOrigin",
                    builder => builder
                        .WithOrigins("http://quizbuzz-frontend.s3-website-us-east-1.amazonaws.com", "https://quizbuzz-frontend.s3-website-us-east-1.amazonaws.com")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
            });


            services.AddAWSService<IAmazonDynamoDB>(new AWSOptions
            {
                Region = Amazon.RegionEndpoint.USEast1,

            });

            services.AddSingleton<IDynamoDBContext, DynamoDBContext>();
            services.AddSingleton<IDynamoDBManager, DynamoDBManager>();
            services.AddSingleton<IMemoryCache, MemoryCache>();
            services.AddSingleton<ICacheService<Session>, CacheService<Session>>();
            services.AddSingleton<ICacheService<Quiz>, CacheService<Quiz>>();
            services.AddSingleton<ICacheService<UserResponses>, CacheService<UserResponses>>();
            services.AddSingleton<ICacheService<SessionResult>, CacheService<SessionResult>>();


            services.AddSingleton<IQuizService, QuizService>();
            services.AddSingleton<ISessionService, SessionService>();
            services.AddSingleton<ISessionNotificationService, SessionNotificationService>();
            services.AddSingleton<QuizCacheService>();



            services.AddControllers();
            services.AddSignalR();
            services.AddEndpointsApiExplorer();
            services.AddSwaggerGen();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseDefaultFiles();
            app.UseStaticFiles();
            app.UseRouting();
            app.UseHttpsRedirection();
            app.UseCors("AllowSpecificOrigin");
            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
                endpoints.MapHub<QuizHub>("/quizHub");
                endpoints.MapHub<SessionHub>("/sessionHub");
                endpoints.MapFallbackToFile("/index.html");
            });
        }
    }
}
