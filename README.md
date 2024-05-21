# QuizBuzz

QuizBuzz is a real-time web application that allows users to create and manage quizzes, conduct live sessions with immediate feedback, and participate in interactive sessions. Users leverage AWS Cognito for secure login and signup.

## Features

- **Quiz Creation:** Registered users can create quizzes with various questions (multiple-choice, true/false, open-ended, etc.).
- **Session Management:** Registered users can create sessions, associating them with a specific quiz. Multiple sessions can be created for the same quiz.
- **Session Joining:** Users can join live sessions created by others, requiring login if user management is enabled.
- **Real-Time Answering:** Participants answer questions during a live session and receive immediate feedback on their responses.
- **Live Statistics:** Session admins can view real-time statistics on user answers, including leaderboards, answer distribution, and overall session progress.
- **AWS Cognito Integration:** Users can register and login using AWS Cognito, enabling secure access control and restricting quiz creation/session management to registered users.

## Installation

### Prerequisites:

- Node.js and npm (or yarn)
- An AWS account with a configured Cognito user pool

### Steps:

1. Clone the repository:

   ```bash
   git clone [https://github.com/](https://github.com/)<your-username>/QuizBuzz.git
