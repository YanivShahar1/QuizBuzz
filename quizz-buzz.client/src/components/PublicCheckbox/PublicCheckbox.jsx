import React from 'react';
import { Form, Col, Row, OverlayTrigger, Tooltip } from 'react-bootstrap';

const PublicCheckbox = ({ isPublic, onPublicChange, tooltipText }) => {
  return (
    <Row className="mb-3">
      <Form.Group as={Col} controlId="formPublic">
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="tooltip-public">
              {tooltipText}
            </Tooltip>
          }
        >
          <Form.Check
            type="checkbox"
            label={
              <>
                Public
              </>
            }
            checked={isPublic}
            onChange={(e) => onPublicChange(e.target.checked)}
          />
        </OverlayTrigger>
      </Form.Group>
    </Row>
  );
};

export default PublicCheckbox;
