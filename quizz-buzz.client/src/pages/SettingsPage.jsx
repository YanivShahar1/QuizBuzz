import React from 'react';
import SettingsForm from '../components/Settings/SettingsForm'; // Import your SettingsForm component

const SettingsPage = () => {
    return (
        <div className="SettingsPage">
            <h2>Settings</h2>
            <SettingsForm />
            {/* Additional content or components related to settings */}
        </div>
    );
};

export default SettingsPage;
