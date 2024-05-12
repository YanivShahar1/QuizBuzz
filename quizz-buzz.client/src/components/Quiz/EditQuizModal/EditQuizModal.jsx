// EditQuizModal.jsx

import React, { useEffect, useState } from 'react';
import { Modal, Button } from 'react-bootstrap';

const EditQuizModal = ({ quiz, show, onClose, onSave }) => {
   

    const [editedTitle, setEditedTitle] = useState(null);
    const [editedDescription, setEditedDescription] = useState(null);
    const [editedCategory, setEditedCategory] = useState(null);
    const [editedQuestions, setEditedQuestions] = useState([]);

    useEffect(() => {
        if(quiz){
            setEditedTitle(quiz.title);
            setEditedDescription(quiz.description);
            setEditedCategory(quiz.category);
            setEditedQuestions([...quiz.questions]);

        }

    },[quiz])

    if (!quiz) {
        return <Modal show={show} onHide={onClose}>Quiz is not available.</Modal>; // Return placeholder or message
    }

   
    const handleSaveChanges = () => {
        onSave({
            ...quiz,
            title: editedTitle,
            description: editedDescription,
            category: editedCategory,
            questions: editedQuestions,
        });
        onClose();
    };

    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Quiz - {quiz.quizID} - {quiz.title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input type="text" className="form-control" id="title" value={editedTitle} onChange={(e) => setEditedTitle(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="description">Description</label>
                    <textarea className="form-control" id="description" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} />
                </div>
                <div className="form-group">
                    <label htmlFor="category">Category</label>
                    <input type="text" className="form-control" id="category" value={editedCategory} onChange={(e) => setEditedCategory(e.target.value)} />
                </div>
                {/* Question editing section */}
                {/* Display input fields for editing questions */}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSaveChanges}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default EditQuizModal;
