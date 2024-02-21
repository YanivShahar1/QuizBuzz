import React, { useState } from 'react';
import { Form, Col, Row } from 'react-bootstrap';

const InfoSection = ({ info, onInfoChange, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredCategories = categories.filter((category) =>
    category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Form.Control
            as="select"
            value={info.category}
            onChange={(e) => onInfoChange({ ...info, category: e.target.value })}
          >
            <option value="">Select category</option>
            {filteredCategories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col} controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            placeholder="Enter description"
            maxLength={200} // Example max length, adjust as needed
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
