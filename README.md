# QuizBuzz

QuizBuzz is a real-time web application that allows registered users to create and manage quizzes, conduct live sessions with immediate feedback, and participate in interactive sessions. Users leverage AWS Cognito for secure login and signup.

## Features

- **Quiz Creation:** Registered users can create quizzes with various question types (multiple-choice, true/false, open-ended, etc.).
- **Session Management:** Registered users can create sessions associated with a specific quiz. Multiple sessions can be created for the same quiz.
- **Session Joining:** Users can join live sessions created by others, requiring login if user management is enabled.
- **Real-Time Answering:** Participants answer questions during a live session and receive immediate feedback on their responses.
- **Live Statistics:** Session admins can view real-time statistics on user answers, including leaderboards, answer distribution, and overall session progress.
- **AWS Cognito Integration:** Users can register and login using AWS Cognito, enabling secure access control and restricting quiz creation/session management to registered users.

## Technologies Used

### React
- **Description:** A JavaScript library for building user interfaces.
- **Website:** [React](https://reactjs.org/)

### Node.js
- **Description:** A JavaScript runtime built on Chrome's V8 JavaScript engine.
- **Website:** [Node.js](https://nodejs.org/)

### Amazon Cognito Identity
- **Description:** Provides authentication, authorization, and user management for web and mobile apps.
- **Website:** [Amazon Cognito](https://aws.amazon.com/cognito/)

### AWS DynamoDB
- **Description:** A fully managed NoSQL database service provided by Amazon Web Services.
- **Website:** [AWS DynamoDB](https://aws.amazon.com/dynamodb/)

### SignalR
- **Description:** A library for adding real-time web functionality to applications.
- **Website:** [SignalR](https://dotnet.microsoft.com/apps/aspnet/signalr)

### .NET Core ASP.NET
- **Description:** A cross-platform, high-performance framework for building modern, cloud-based, internet-connected applications.
- **Website:** [ASP.NET](https://dotnet.microsoft.com/apps/aspnet)

## Preview Videos

### Quiz Creation
[![Quiz Creation Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

### Live Session Management
[![Live Session Management Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
