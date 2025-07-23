import { DATE_FORMATS } from '../constant/index.js';

/**
 * Date utility functions
 */
class DateUtil {

    /**
     * Format date to ISO string
     * @param {Date|string} date - Date to format
     * @returns {string} ISO formatted date
     */
    static toISO(date) {
        return new Date(date).toISOString();
    }

    /**
     * Format date to date only (YYYY-MM-DD)
     * @param {Date|string} date - Date to format
     * @returns {string} Date only string
     */
    static toDateOnly(date) {
        return new Date(date).toISOString().split('T')[0];
    }

    /**
     * Format date to datetime string (YYYY-MM-DD HH:mm:ss)
     * @param {Date|string} date - Date to format
     * @returns {string} Datetime string
     */
    static toDateTime(date) {
        const d = new Date(date);
        return d.toISOString().replace('T', ' ').substring(0, 19);
    }

    /**
     * Format date for display (MMM DD, YYYY)
     * @param {Date|string} date - Date to format
     * @returns {string} Display formatted date
     */
    static toDisplay(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit'
        });
    }

    /**
     * Format date for display with time (MMM DD, YYYY HH:mm)
     * @param {Date|string} date - Date to format
     * @returns {string} Display formatted date with time
     */
    static toDisplayWithTime(date) {
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    /**
     * Get start of day
     * @param {Date|string} date - Input date
     * @returns {Date} Start of day
     */
    static startOfDay(date = new Date()) {
        const d = new Date(date);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    /**
     * Get end of day
     * @param {Date|string} date - Input date
     * @returns {Date} End of day
     */
    static endOfDay(date = new Date()) {
        const d = new Date(date);
        d.setHours(23, 59, 59, 999);
        return d;
    }

    /**
     * Get start of week
     * @param {Date|string} date - Input date
     * @returns {Date} Start of week (Monday)
     */
    static startOfWeek(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
        return new Date(d.setDate(diff));
    }

    /**
     * Get start of month
     * @param {Date|string} date - Input date
     * @returns {Date} Start of month
     */
    static startOfMonth(date = new Date()) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth(), 1);
    }

    /**
     * Get end of month
     * @param {Date|string} date - Input date
     * @returns {Date} End of month
     */
    static endOfMonth(date = new Date()) {
        const d = new Date(date);
        return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    /**
     * Add days to date
     * @param {Date|string} date - Input date
     * @param {number} days - Number of days to add
     * @returns {Date} New date
     */
    static addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    /**
     * Add months to date
     * @param {Date|string} date - Input date
     * @param {number} months - Number of months to add
     * @returns {Date} New date
     */
    static addMonths(date, months) {
        const d = new Date(date);
        d.setMonth(d.getMonth() + months);
        return d;
    }

    /**
     * Get difference in days between two dates
     * @param {Date|string} date1 - First date
     * @param {Date|string} date2 - Second date
     * @returns {number} Difference in days
     */
    static getDaysDifference(date1, date2) {
        const d1 = new Date(date1);
        const d2 = new Date(date2);
        const timeDiff = Math.abs(d2.getTime() - d1.getTime());
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    }

    /**
     * Check if date is today
     * @param {Date|string} date - Date to check
     * @returns {boolean} Is today
     */
    static isToday(date) {
        const d = new Date(date);
        const today = new Date();
        return d.toDateString() === today.toDateString();
    }

    /**
     * Check if date is yesterday
     * @param {Date|string} date - Date to check
     * @returns {boolean} Is yesterday
     */
    static isYesterday(date) {
        const d = new Date(date);
        const yesterday = this.addDays(new Date(), -1);
        return d.toDateString() === yesterday.toDateString();
    }

    /**
     * Check if date is in the past
     * @param {Date|string} date - Date to check
     * @returns {boolean} Is past date
     */
    static isPast(date) {
        return new Date(date) < new Date();
    }

    /**
     * Check if date is in the future
     * @param {Date|string} date - Date to check
     * @returns {boolean} Is future date
     */
    static isFuture(date) {
        return new Date(date) > new Date();
    }

    /**
     * Get relative time string
     * @param {Date|string} date - Date to format
     * @returns {string} Relative time string
     */
    static getRelativeTime(date) {
        const d = new Date(date);
        const now = new Date();
        const diff = now.getTime() - d.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const weeks = Math.floor(days / 7);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
        if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
        if (days < 7) return `${days} day${days !== 1 ? 's' : ''} ago`;
        if (weeks < 4) return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
        if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
        return `${years} year${years !== 1 ? 's' : ''} ago`;
    }

    /**
     * Get age from birth date
     * @param {Date|string} birthDate - Birth date
     * @returns {number} Age in years
     */
    static getAge(birthDate) {
        const birth = new Date(birthDate);
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    }

    /**
     * Generate date range array
     * @param {Date|string} startDate - Start date
     * @param {Date|string} endDate - End date
     * @param {string} step - Step interval ('day', 'week', 'month')
     * @returns {Array} Array of dates
     */
    static getDateRange(startDate, endDate, step = 'day') {
        const dates = [];
        const current = new Date(startDate);
        const end = new Date(endDate);

        while (current <= end) {
            dates.push(new Date(current));

            switch (step) {
                case 'day':
                    current.setDate(current.getDate() + 1);
                    break;
                case 'week':
                    current.setDate(current.getDate() + 7);
                    break;
                case 'month':
                    current.setMonth(current.getMonth() + 1);
                    break;
                default:
                    current.setDate(current.getDate() + 1);
            }
        }

        return dates;
    }

    /**
     * Get business days between two dates (excluding weekends)
     * @param {Date|string} startDate - Start date
     * @param {Date|string} endDate - End date
     * @returns {number} Number of business days
     */
    static getBusinessDays(startDate, endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let businessDays = 0;
        const current = new Date(start);

        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday (0) or Saturday (6)
                businessDays++;
            }
            current.setDate(current.getDate() + 1);
        }

        return businessDays;
    }

    /**
     * Validate date string
     * @param {string} dateString - Date string to validate
     * @returns {boolean} Is valid date
     */
    static isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date.getTime());
    }

    /**
     * Get current timestamp
     * @returns {number} Current timestamp
     */
    static now() {
        return Date.now();
    }

    /**
     * Get current UTC timestamp
     * @returns {number} Current UTC timestamp
     */
    static utcNow() {
        return new Date().getTime();
    }
}

export default DateUtil;
