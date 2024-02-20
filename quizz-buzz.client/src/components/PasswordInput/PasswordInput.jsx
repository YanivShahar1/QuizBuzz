// PasswordInput.jsx

import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Import eye icons
import './PasswordInput.css'; // Import CSS file


/**
 * PasswordInput component
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - The current value of the input
 * @param {Function} props.onChange - Function to handle input change
 * @returns {JSX.Element} - Password input component
 */


const PasswordInput = ({ passwordValue, onChange }) => {
    // State to toggle password visibility
    const [passwordVisible, setPasswordVisible] = useState(false); // State to toggle password visibility

    /**
    * Toggle password visibility
    */
    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handlePasswordChange = (e) => {
        console.log("onPasswordChange!", e.target.value, e);
        onChange(e.target.value);
    };

    return (
        <div className="password-input-container">
            {/* Input field with dynamic type based on password visibility */}
            <input
                type={passwordVisible ? "text" : "password"}
                value={passwordValue}
                onChange={handlePasswordChange}
                className="password-input"
            />
            {/* Eye icon to toggle password visibility */}
            <FontAwesomeIcon
                icon={passwordVisible ? faEyeSlash : faEye}
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
            />
        </div>
    );
};

export default PasswordInput;
