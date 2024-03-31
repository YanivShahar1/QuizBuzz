import React, { useState, useEffect } from 'react';
import { Form, Col, Row } from 'react-bootstrap';
import QuizCategories from './QuizCategories';


const InfoSection = ({ info, onInfoChange, categories }) => {

  const handleCategorySelect = (category) => {
    onInfoChange({ ...info, category: category });
  };

  return (
    <Form>
      <Row className="mb-3">
        <Form.Group as={Col} controlId="formTitle">
          <Form.Label>Title</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter title"
            maxLength={50}
            value={info.title}
            onChange={(e) => onInfoChange({ ...info, title: e.target.value })}
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
      <Form.Group as={Col} controlId="formCategory">
      <Form.Label>Category</Form.Label>
      <div className="position-relative">
        <QuizCategories
          categories={categories}
          onCategorySelect={handleCategorySelect}
        />
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
            maxLength={200}
            value={info.description}
            onChange={(e) => onInfoChange({ ...info, description: e.target.value })}
          />
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formPublic">
          <Form.Check
            type="checkbox"
            label={
              <>
                Public <span className="text-info">(?)</span>
              </>
            }
            checked={info.isPublic}
            onChange={(e) => onInfoChange({ ...info, isPublic: e.target.checked })}
          />
        </Form.Group>
      </Row>
    </Form>
  );
};

export default InfoSection;
