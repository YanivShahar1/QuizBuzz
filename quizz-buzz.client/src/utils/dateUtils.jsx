// dateUtils.js

/**
 * Format the date in the user's locale.
 * @param {string} dateString - The date string to format.
 * @returns {string} The formatted date string.
 */
export const formatDate = (dateString) => {
    try {
        console.log(`in format date, formatting: ${dateString}`);
        const userLocale = navigator.language || 'en-US';
        const formattedDate = new Date(dateString).toLocaleString(userLocale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: `2-digit`
        });
        console.log(`result: ${formattedDate}`);
        return formattedDate;
    } catch (error) {
        console.error('Error formatting date:', error);
        // Return the original date string if formatting fails
        return dateString;
    }
};
