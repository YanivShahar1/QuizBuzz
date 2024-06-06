using QuizBuzz.Backend;


var builder = Host.CreateDefaultBuilder(args)
    .ConfigureLogging((hostingContext, logging) =>
    {
        logging.ClearProviders(); // Clear out any previously configured loggers
        logging.AddConsole();     // Add Console logger
        logging.AddDebug();       // Add Debug logger
        logging.SetMinimumLevel(LogLevel.Information); // Set the minimum log level (e.g., Information)
    })
    .ConfigureWebHostDefaults(webBuilder =>
    {
        webBuilder.UseStartup<Startup>();
    });

var app = builder.Build();

app.Run();
