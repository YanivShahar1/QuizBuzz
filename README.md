# QuizBuzz

QuizBuzz is a real-time web application that allows users to create and manage quizzes, conduct live sessions with immediate feedback, and participate in interactive sessions. Users leverage AWS Cognito for secure login and signup.

## Features

- **Quiz Creation:** Registered users can create quizzes with various questions (multiple-choice, true/false, open-ended, etc.).
- **Session Management:** Registered users can create sessions, associating them with a specific quiz. Multiple sessions can be created for the same quiz.
- **Session Joining:** Users can join live sessions created by others, requiring login if user management is enabled.
- **Real-Time Answering:** Participants answer questions during a live session and receive immediate feedback on their responses.
- **Live Statistics:** Session admins can view real-time statistics on user answers, including leaderboards, answer distribution, and overall session progress.
- **AWS Cognito Integration:** Users can register and login using AWS Cognito, enabling secure access control and restricting quiz creation/session management to registered users.

# Technologies Used
### React
- Description: A JavaScript library for building user interfaces.
- [Website](https://reactjs.org/)

### Node.js
- Description: A JavaScript runtime built on Chrome's V8 JavaScript engine.
- [Website](https://nodejs.org/)

### Amazon Cognito Identity
- Description: Provides authentication, authorization, and user management for web and mobile apps.
- [Website](https://aws.amazon.com/cognito/)

### AWS DynamoDB
- Description: A fully managed NoSQL database service provided by Amazon Web Services.
- [Website](https://aws.amazon.com/dynamodb/)

### SignalR
- Description: A library for adding real-time web functionality to applications.
- [Website](https://dotnet.microsoft.com/apps/aspnet/signalr)

## .NET Core ASP.NET
- Description: A cross-platform, high-performance framework for building modern, cloud-based, internet-connected applications.
- [Website](https://dotnet.microsoft.com/apps/aspnet)
- 
## Installation

### Prerequisites:

- Node.js and npm (or yarn)
- An AWS account with a configured Cognito user pool

### Steps:

#### 1. Clone the repository

#### 2. Install dependencies

#### 3. Configure AWS Credentials:

Before using the QuizBuzz application, you need to configure your AWS credentials. Follow the instructions in the [AWS documentation](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-configure.html) to set up AWS CLI configuration on your machine. This includes setting up access keys, regions, and other configuration details necessary for QuizBuzz to interact with AWS services securely.

4. Start the development server
