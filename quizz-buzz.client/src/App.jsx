import { HashRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import QuizPage from './pages/quiz/QuizPage';
import React, { useState } from 'react';

//pages
import LoginPage from './pages/auth/LoginPage';
import LogoutPage from './pages/auth/LogoutPage';
import SignupPage from './pages/auth/SignupPage';
import QuizResultsPage from './pages/quiz/QuizResultsPage';
import HomePage from './pages/HomePage';
import SettingsPage from './pages/SettingsPage'
import DashboardPage from './pages/dashboard/DashboardPage';
import CreateQuizPage from './pages/quiz/createQuiz/CreateQuizPage';
import CreateSessionPage from './pages/session/createSession/CreateSessionPage';
import { Button, Col, Row , Container} from 'react-bootstrap';
import SessionPage from './pages/session/SessionPage';

//css 
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {

    
    return (
        <Router>
            <Header />
            <Routes>
               <Route path="/" element={<HomePage />} />
               <Route path="/create-quiz" element={<CreateQuizPage />} />
               <Route path="/create-session" element={<CreateSessionPage />} />
               <Route path="/quiz/:quizId" element={<QuizPage />} />
               <Route path="/quiz-results/:quizId" element={<QuizResultsPage />} />
               <Route path="/session/:sessionId" element={<SessionPage />} />
               {/*<Route path="/user-profile" element={<UserProfilePage />} />*/}
               <Route path="/settings" element={<SettingsPage />} />
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

