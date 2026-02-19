/**
 * Formats a date string or object into a readable string
 * @param {string|Date} date - The date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (date, options = {}) => {
    if (!date) return 'N/A';

    try {
        const d = new Date(date);
        // Check if date is valid
        if (isNaN(d.getTime())) return 'Invalid Date';

        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };

        return new Intl.DateTimeFormat('en-US', { ...defaultOptions, ...options }).format(d);
    } catch (e) {
        console.error('Error formatting date:', e);
        return String(date);
    }
};

/**
 * Calculates age from birthdate
 * @param {string|Date} birthDate 
 * @returns {string} Age string
 */
export const calculateAge = (birthDate) => {
    if (!birthDate) return '';
    try {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const m = today.getMonth() - birth.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        return age;
    } catch (e) {
        return '';
    }
};
