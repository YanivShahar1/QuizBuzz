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

/**
 * Sort an array of dates in descending order.
 * @param {string[]} dates - The array of date strings to sort.
 * @returns {string[]} The sorted array of date strings.
 */
export const sortDatesDescending = (dates) => {
    return dates.sort((a, b) => new Date(b) - new Date(a));
};

/**
 * Compare two date strings.
 * @param {string} dateA - The first date string to compare.
 * @param {string} dateB - The second date string to compare.
 * @returns {number} A negative number if dateA is less than dateB, 
 *                   zero if they are equal, 
 *                   a positive number if dateA is greater than dateB.
 */
export const compareDatesDescending = (dateA, dateB) => {
    return new Date(dateB) - new Date(dateA);
};

