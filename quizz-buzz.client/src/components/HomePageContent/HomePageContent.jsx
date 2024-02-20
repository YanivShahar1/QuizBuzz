import React from 'react';
import { Link } from 'react-router-dom';

function HomePageContent() {
    return (
        <div className="container text-center mt-5">
            <h2>Welcome to QuizApp!</h2>
            <div className="row mt-5">
                <div className="col-md-6 mb-4">
                    <Link to="/create-quiz" className="btn btn-primary btn-lg d-block">
                        <i className="fas fa-plus-circle fa-3x mb-2"></i>
                        Create Quiz
                    </Link>
                </div>
                <div className="col-md-6 mb-4">
                    <Link to="/enter-quiz" className="btn btn-success btn-lg d-block">
                        <i className="fas fa-sign-in-alt fa-3x mb-2"></i>
                        Enter Quiz
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default HomePageContent;
