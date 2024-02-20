import React from 'react';
import { Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';

const InfoSection = ({ quizInfo, handleQuizInfoChange, categories }) => {

    return (
        <Form>
            <Form.Group as={Row} controlId="formQuizTitle">
                <Form.Label column sm="2">
                    Title:
                </Form.Label>
                <Col sm="10">
                    <Form.Control
                        type="text"
                        placeholder="Enter quiz title"
                        name="title"
                        value={quizInfo.title}
                        onChange={(e) => handleQuizInfoChange('title', e.target.value)}
                    />
                </Col>
            </Form.Group>

            {/* Autocomplete Input for Category */}
            <Form.Group controlId="formQuizCategory">
                <Form.Label>Category:</Form.Label>

                <Select
                    options={categories}
                    value={categories.find(option => option.value === quizInfo.category)} // Find the matching option in the list
                    name="category"
                    onChange={(selectedOption) => handleQuizInfoChange('category', selectedOption.value)}                    isSearchable
                    placeholder="Select or type to search..."
                />
            </Form.Group>


            <Form.Group as={Row} controlId="formQuizDescription">
                <Form.Label column sm="2">
                    Description:
                </Form.Label>
                <Col sm="10">
                    <Form.Control
                        as="textarea"
                        placeholder="Enter quiz description"
                        name="description"
                        value={quizInfo.description}
                        onChange={(e) => handleQuizInfoChange('description', e.target.value)}
                    />
                </Col>
            </Form.Group>

        </Form>
    )
}

export default InfoSection;



