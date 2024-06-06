import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'; // Import eye icons
import './PasswordInput.css'; // Import CSS file

const PasswordInput = ({ passwordValue, onChange }) => {
    const [passwordVisible, setPasswordVisible] = useState(false);

    const togglePasswordVisibility = () => {
        setPasswordVisible(!passwordVisible);
    };

    const handlePasswordChange = (e) => {
        onChange(e.target.value);
    };

    return (
        <div className="password-input-container">
            <input
                type={passwordVisible ? "text" : "password"}
                value={passwordValue}
                onChange={handlePasswordChange}
                className="password-input"
            />
            <FontAwesomeIcon
                icon={passwordVisible ? faEyeSlash : faEye}
                className="password-toggle-icon"
                onClick={togglePasswordVisibility}
            />
        </div>
    );
};

export default PasswordInput;
