import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Add this in node_modules/react-dom/index.js
window.React1 = require('react');

// Add this in your component file
require('react-dom');
window.React2 = require('react');
console.log(window.React1 === window.React2);
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);

