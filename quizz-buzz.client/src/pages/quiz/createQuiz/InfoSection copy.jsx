import { Form, Row, Col } from 'react-bootstrap';
import Select from 'react-select';

const InfoSection = ({ info, onInfoChange, categories }) => {
    console.log("in InfoSection  1 info:",info);
    console.log("in InfoSection  1 categories:",categories);
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
                        value={info?.title || ''} 
                        onChange={(e) => onInfoChange('title', e.target.value)}
                    />
                </Col>
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
                        value={info?.descripion || ''} 
                        onChange={(e) => onInfoChange('description', e.target.value)}
                    />
                </Col>
            </Form.Group>
        </Form>
    )
}

export default InfoSection;



