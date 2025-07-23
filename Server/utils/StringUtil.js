/**
 * String utility functions
 */
class StringUtil {

    /**
     * Convert string to uppercase and trim
     * @param {string} str - String to convert
     * @returns {string} Uppercase trimmed string
     */
    static toUpperCase(str) {
        return str ? str.trim().toUpperCase() : '';
    }

    /**
     * Convert string to lowercase and trim
     * @param {string} str - String to convert
     * @returns {string} Lowercase trimmed string
     */
    static toLowerCase(str) {
        return str ? str.trim().toLowerCase() : '';
    }

    /**
     * Convert string to title case
     * @param {string} str - String to convert
     * @returns {string} Title case string
     */
    static toTitleCase(str) {
        if (!str) return '';

        return str
            .trim()
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
    }

    /**
     * Convert string to camelCase
     * @param {string} str - String to convert
     * @returns {string} CamelCase string
     */
    static toCamelCase(str) {
        if (!str) return '';

        return str
            .trim()
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
    }

    /**
     * Convert string to snake_case
     * @param {string} str - String to convert
     * @returns {string} Snake_case string
     */
    static toSnakeCase(str) {
        if (!str) return '';

        return str
            .trim()
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('_');
    }

    /**
     * Convert string to kebab-case
     * @param {string} str - String to convert
     * @returns {string} Kebab-case string
     */
    static toKebabCase(str) {
        if (!str) return '';

        return str
            .trim()
            .replace(/\W+/g, ' ')
            .split(/ |\B(?=[A-Z])/)
            .map(word => word.toLowerCase())
            .join('-');
    }

    /**
     * Generate slug from string
     * @param {string} str - String to convert
     * @returns {string} URL-friendly slug
     */
    static toSlug(str) {
        if (!str) return '';

        return str
            .trim()
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // Remove special characters
            .replace(/[\s_-]+/g, '-') // Replace spaces, underscores with hyphens
            .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
    }

    /**
     * Truncate string to specified length
     * @param {string} str - String to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated string
     */
    static truncate(str, length, suffix = '...') {
        if (!str || str.length <= length) return str;

        return str.substring(0, length).trim() + suffix;
    }

    /**
     * Truncate string at word boundary
     * @param {string} str - String to truncate
     * @param {number} length - Maximum length
     * @param {string} suffix - Suffix to add (default: '...')
     * @returns {string} Truncated string
     */
    static truncateWords(str, length, suffix = '...') {
        if (!str || str.length <= length) return str;

        const truncated = str.substring(0, length);
        const lastSpace = truncated.lastIndexOf(' ');

        if (lastSpace > 0) {
            return truncated.substring(0, lastSpace) + suffix;
        }

        return truncated + suffix;
    }

    /**
     * Remove extra whitespace and normalize spaces
     * @param {string} str - String to normalize
     * @returns {string} Normalized string
     */
    static normalizeWhitespace(str) {
        if (!str) return '';

        return str.trim().replace(/\s+/g, ' ');
    }

    /**
     * Check if string is empty or only whitespace
     * @param {string} str - String to check
     * @returns {boolean} Is empty or whitespace
     */
    static isEmpty(str) {
        return !str || str.trim().length === 0;
    }

    /**
     * Check if string contains only digits
     * @param {string} str - String to check
     * @returns {boolean} Contains only digits
     */
    static isNumeric(str) {
        return /^\d+$/.test(str);
    }

    /**
     * Check if string contains only alphanumeric characters
     * @param {string} str - String to check
     * @returns {boolean} Contains only alphanumeric characters
     */
    static isAlphanumeric(str) {
        return /^[a-zA-Z0-9]+$/.test(str);
    }

    /**
     * Check if string is a valid email format
     * @param {string} str - String to check
     * @returns {boolean} Is valid email format
     */
    static isEmail(str) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(str);
    }

    /**
     * Generate random string
     * @param {number} length - Length of random string
     * @param {string} charset - Character set to use
     * @returns {string} Random string
     */
    static generateRandom(length = 8, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        return result;
    }

    /**
     * Generate random alphanumeric string
     * @param {number} length - Length of random string
     * @returns {string} Random alphanumeric string
     */
    static generateAlphanumeric(length = 8) {
        return this.generateRandom(length, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789');
    }

    /**
     * Generate random numeric string
     * @param {number} length - Length of random string
     * @returns {string} Random numeric string
     */
    static generateNumeric(length = 6) {
        return this.generateRandom(length, '0123456789');
    }

    /**
     * Mask string (e.g., for sensitive data)
     * @param {string} str - String to mask
     * @param {number} visibleStart - Number of visible characters at start
     * @param {number} visibleEnd - Number of visible characters at end
     * @param {string} maskChar - Character to use for masking
     * @returns {string} Masked string
     */
    static mask(str, visibleStart = 2, visibleEnd = 2, maskChar = '*') {
        if (!str || str.length <= visibleStart + visibleEnd) {
            return str;
        }

        const start = str.substring(0, visibleStart);
        const end = str.substring(str.length - visibleEnd);
        const maskLength = str.length - visibleStart - visibleEnd;
        const masked = maskChar.repeat(maskLength);

        return start + masked + end;
    }

    /**
     * Extract initials from name
     * @param {string} name - Full name
     * @param {number} maxInitials - Maximum number of initials
     * @returns {string} Initials
     */
    static getInitials(name, maxInitials = 2) {
        if (!name) return '';

        return name
            .trim()
            .split(/\s+/)
            .slice(0, maxInitials)
            .map(word => word.charAt(0).toUpperCase())
            .join('');
    }

    /**
     * Count words in string
     * @param {string} str - String to count words in
     * @returns {number} Word count
     */
    static countWords(str) {
        if (!str) return 0;

        return str.trim().split(/\s+/).filter(word => word.length > 0).length;
    }

    /**
     * Escape HTML characters
     * @param {string} str - String to escape
     * @returns {string} HTML escaped string
     */
    static escapeHtml(str) {
        if (!str) return '';

        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;'
        };

        return str.replace(/[&<>"'/]/g, char => htmlEscapes[char]);
    }

    /**
     * Unescape HTML characters
     * @param {string} str - String to unescape
     * @returns {string} HTML unescaped string
     */
    static unescapeHtml(str) {
        if (!str) return '';

        const htmlUnescapes = {
            '&amp;': '&',
            '&lt;': '<',
            '&gt;': '>',
            '&quot;': '"',
            '&#x27;': "'",
            '&#x2F;': '/'
        };

        return str.replace(/&(amp|lt|gt|quot|#x27|#x2F);/g, entity => htmlUnescapes[entity]);
    }

    /**
     * Remove accents from string
     * @param {string} str - String to remove accents from
     * @returns {string} String without accents
     */
    static removeAccents(str) {
        if (!str) return '';

        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }

    /**
     * Reverse string
     * @param {string} str - String to reverse
     * @returns {string} Reversed string
     */
    static reverse(str) {
        if (!str) return '';

        return str.split('').reverse().join('');
    }

    /**
     * Check if string is palindrome
     * @param {string} str - String to check
     * @returns {boolean} Is palindrome
     */
    static isPalindrome(str) {
        if (!str) return false;

        const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
        return cleaned === this.reverse(cleaned);
    }

    /**
     * Repeat string n times
     * @param {string} str - String to repeat
     * @param {number} times - Number of times to repeat
     * @returns {string} Repeated string
     */
    static repeat(str, times) {
        if (!str || times <= 0) return '';

        return str.repeat(times);
    }

    /**
     * Pad string to specified length
     * @param {string} str - String to pad
     * @param {number} length - Target length
     * @param {string} padChar - Character to pad with
     * @param {string} direction - 'left', 'right', or 'both'
     * @returns {string} Padded string
     */
    static pad(str, length, padChar = ' ', direction = 'right') {
        if (!str) str = '';

        const padLength = Math.max(0, length - str.length);

        switch (direction) {
            case 'left':
                return padChar.repeat(padLength) + str;
            case 'both':
                const leftPad = Math.floor(padLength / 2);
                const rightPad = padLength - leftPad;
                return padChar.repeat(leftPad) + str + padChar.repeat(rightPad);
            default: // 'right'
                return str + padChar.repeat(padLength);
        }
    }
}

export default StringUtil;
