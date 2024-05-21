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

- ****React:**** A JavaScript library for building user interfaces. [Website](https://reactjs.org/)
- **Node.js:** A JavaScript runtime built on Chrome's V8 engine. [Website](https://nodejs.org/)
- **Amazon Cognito:** Authentication, authorization, and user management. [Website](https://aws.amazon.com/cognito/)
- **AWS DynamoDB:** Fully managed NoSQL database service. [Website](https://aws.amazon.com/dynamodb/)
- **SignalR:** Real-time web functionality library. [Website](https://dotnet.microsoft.com/apps/aspnet/signalr)
- **.NET Core ASP.NET:** Cross-platform framework for building modern, cloud-based applications. [Website (https://dotnet.microsoft.com/apps/aspnet)

## Preview Videos

### Quiz Creation
[![Quiz Creation Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)

### Live Session Management
[![Live Session Management Video](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
