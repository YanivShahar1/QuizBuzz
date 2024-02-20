import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import QuizHistory from './components/Quiz/QuizHistory';
import CreateQuizPage from './pages/quiz/createQuiz/CreateQuizPage';
import QuizPage from './pages/quiz/QuizPage';
import React, { useState } from 'react';

//pages
import LoginPage from './pages/auth/LoginPage';
import LogoutPage from './pages/auth/LogoutPage';
import SignupPage from './pages/auth/SignupPage';
import QuizResultsPage from './pages/quiz/QuizResultsPage';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/dashboard/DashboardPage';
import { Button, Col, Row , Container} from 'react-bootstrap';


//css 
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { HubConnectionBuilder, LogLevel,HttpTransportType } from '@microsoft/signalr';
import WaitingRoom from './components/WaitingRoom';

function App() {

    const[conn, setConnection] = useState();
    const joinChatRoom = async (username, chatroom) => {
        try {
            //initiate a connection
            const conn = new HubConnectionBuilder()
                            .withUrl("https://localhost:7141/Chat")
                            .configureLogging(LogLevel.Information)
                            .build();
            //set up a handler
            conn.on("JoinSpecificChatRoom",(username, msg) => {
                console.log("msg: ",username, msg);

            } );

            await conn.start();
            await conn.invoke("JoinSpecificChatRoom", {username, chatroom});
            setConnection(conn);



        
        }catch(e){
            console.log(e);
        }
    }
    return (
        <Router>
            <Header />
            <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/create-quiz" element={<CreateQuizPage />} />
               <Route path="/quiz/:quizId" element={<QuizPage />} />
               <Route path="/quiz-results/:quizId" element={<QuizResultsPage />} />
               {/*<Route path="/user-profile" element={<UserProfilePage />} />*/}
               {/*<Route path="/settings" element={<SettingsPage />} />*/}
               <Route path="/dashboard" element={<DashboardPage />} />
               <Route path="/login" element={<LoginPage />} />
               <Route path="/logout" element={<LogoutPage />} />
               <Route path="/signup" element={<SignupPage />} />
            </Routes>
            <Footer />
       </Router>
    )
}

export default App;

