using Amazon.CognitoIdentityProvider;
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.DataModel;
using Amazon.Extensions.NETCore.Setup;
using Amazon.Runtime;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using QuizBuzz.Backend.DataAccess;
using QuizBuzz.Backend.Hubs;
using QuizBuzz.Backend.Services;
using System;

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
                        .WithOrigins("https://localhost:3000", "http://localhost:3000")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials());
            });


            // Add AWS services to the container.
			//TODO -> change EnvironmentVariablesAWSCredentials to .env file
            services.AddAWSService<IAmazonDynamoDB>(new AWSOptions
            {
                Region = Amazon.RegionEndpoint.USEast1, // Replace with your AWS region
                Credentials = new EnvironmentVariablesAWSCredentials() // This will use the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
            });

            services.AddSingleton<IDynamoDBContext, DynamoDBContext>();
            services.AddSingleton<IDynamoDBDataManager, DynamoDBDataManager>();
            services.AddSingleton<IMemoryCache, MemoryCache>();
            services.AddSingleton<IQuizService, QuizService>();
            services.AddSingleton<ISessionService, SessionService>();
            services.AddSingleton<ISessionNotificationService, SessionNotificationService>();
            services.AddSingleton<SessionCacheService>();



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
            app.UseCors("AllowSpecificOrigin");
            app.UseHttpsRedirection();
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
