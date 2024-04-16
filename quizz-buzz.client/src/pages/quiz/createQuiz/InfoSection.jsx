import React from 'react';
import { Form, Col, Row } from 'react-bootstrap';
import QuizCategories from './QuizCategories';
import PublicCheckbox from '../../../components/PublicCheckbox/PublicCheckbox';
import './InfoSection.css';

const InfoSection = ({ info, onInfoChange, categories }) => {
  const handleCategorySelect = (category) => {
    onInfoChange({ ...info, category: category });
  };

  const handlePublicChange = (value) => {
    onInfoChange({ ...info, isPublic: value });
  };

  return (
    <Form>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            maxLength={70}
            value={info.title}
            onChange={(e) => onInfoChange({ ...info, title: e.target.value })}
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formCategory">
          <Form.Label>Category</Form.Label>
          <div className="position-relative">
            <QuizCategories categories={categories} onCategorySelect={handleCategorySelect} />
          </div>
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter description"
            maxLength={400}
            value={info.description}
            onChange={(e) => onInfoChange({ ...info, description: e.target.value })}
          />
        </Form.Group>
      </Row>

      {/*  PublicCheckbox component */}
      <PublicCheckbox 
        isPublic={info.isPublic}
        onPublicChange={handlePublicChange}
        tooltipText="When checked, this option makes the quiz publicly accessible for other users to utilize."
      />
    </Form>
  );
};

export default InfoSection;
