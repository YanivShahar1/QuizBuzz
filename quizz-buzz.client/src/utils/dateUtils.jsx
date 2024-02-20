// dateUtils.js

/**
 * Format the date in the user's locale.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString) => {
    try {
        const userLocale = navigator.language || 'en-US';
        const formattedDate = new Date(dateString).toLocaleString(userLocale, {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        return formattedDate;
    } catch (error) {
        console.error('Error formatting date:', error);
        // Return the original date string if formatting fails
        return dateString;
    }
};
