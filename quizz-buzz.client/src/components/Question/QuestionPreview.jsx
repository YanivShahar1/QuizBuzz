import React from 'react';
import { ListGroup } from 'react-bootstrap';
import './QuestionPreview.css';

const QuestionPreview = ({ question, index }) => {
  return (
    <div className="question">
      <ListGroup.Item >
      <div>{"Question "}{index} : {question.question}</div>
      <ListGroup horizontal>
      {question.options.map((option, index) => (
          <ListGroup.Item  key={index}>
            <span style={{ color: question.correctAnswers.includes(index) ? 'green' : 'red' }}>{option}</span>
          </ListGroup.Item>
      ))}
      </ListGroup>
    </ListGroup.Item>

    </div>
    
  );
};

export default QuestionPreview;
