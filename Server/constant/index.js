// Transaction Types
export const TRANSACTION_TYPES = {
    IN: 'IN',
    OUT: 'OUT',
    ADJUSTMENT: 'ADJUSTMENT'
};

// Product Units
export const PRODUCT_UNITS = {
    PIECES: 'pcs',
    KILOGRAM: 'kg',
    POUNDS: 'lbs',
    LITER: 'liter',
    METER: 'meter',
    BOX: 'box',
    PACK: 'pack'
};

// User Roles
export const USER_ROLES = ['admin', 'manager', 'user'];

// User Status
export const USER_STATUS = ['active', 'inactive', 'suspended'];

// HTTP Status Codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    INTERNAL_SERVER_ERROR: 500
};

// API Response Messages
export const MESSAGES = {
    SUCCESS: {
        CREATED: 'Resource created successfully',
        UPDATED: 'Resource updated successfully',
        DELETED: 'Resource deleted successfully',
        FETCHED: 'Data retrieved successfully'
    },
    ERROR: {
        NOT_FOUND: 'Resource not found',
        INVALID_DATA: 'Invalid data provided',
        DUPLICATE_ENTRY: 'Duplicate entry found',
        INSUFFICIENT_STOCK: 'Insufficient stock available',
        SERVER_ERROR: 'Internal server error occurred',
        VALIDATION_ERROR: 'Validation failed',
        UNAUTHORIZED: 'Unauthorized access',
        FORBIDDEN: 'Access forbidden'
    }
};

// Pagination Defaults
export const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100,
    MIN_LIMIT: 1
};

// Sort Orders
export const SORT_ORDER = {
    ASC: 'ASC',
    DESC: 'DESC'
};

// Stock Alert Levels
export const STOCK_LEVELS = {
    OUT_OF_STOCK: 0,
    LOW_STOCK_THRESHOLD: 10,
    CRITICAL_STOCK_THRESHOLD: 5
};

// Database Constraints
export const DATABASE_CONSTRAINTS = {
    SKU: {
        MIN_LENGTH: 3,
        MAX_LENGTH: 50
    },
    PRODUCT_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 200
    },
    CATEGORY_NAME: {
        MIN_LENGTH: 2,
        MAX_LENGTH: 100
    },
    BARCODE: {
        MAX_LENGTH: 100
    },
    REFERENCE_NUMBER: {
        MAX_LENGTH: 100
    },
    LOCATION: {
        MAX_LENGTH: 100
    }
};

// Validation Patterns
export const VALIDATION_PATTERNS = {
    SKU: /^[A-Z0-9-_]+$/,
    BARCODE: /^[0-9]+$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s-()]+$/
};

// Cache Keys
export const CACHE_KEYS = {
    PRODUCTS: 'products',
    CATEGORIES: 'categories',
    INVENTORY: 'inventory',
    DASHBOARD_STATS: 'dashboard_stats',
    LOW_STOCK_ALERTS: 'low_stock_alerts'
};

// Cache TTL (Time To Live) in seconds
export const CACHE_TTL = {
    SHORT: 300,    // 5 minutes
    MEDIUM: 1800,  // 30 minutes
    LONG: 3600,    // 1 hour
    EXTRA_LONG: 86400  // 24 hours
};

// Date Formats
export const DATE_FORMATS = {
    ISO: 'YYYY-MM-DDTHH:mm:ss.SSSZ',
    DATE_ONLY: 'YYYY-MM-DD',
    DATETIME: 'YYYY-MM-DD HH:mm:ss',
    DISPLAY: 'MMM DD, YYYY',
    DISPLAY_WITH_TIME: 'MMM DD, YYYY HH:mm'
};

// Environment Types
export const ENVIRONMENTS = {
    DEVELOPMENT: 'development',
    PRODUCTION: 'production',
    TEST: 'test',
    STAGING: 'staging'
};

// File Upload Constraints
export const FILE_UPLOAD = {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.pdf']
};

// Rate Limiting
export const RATE_LIMITS = {
    GENERAL: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100 // limit each IP to 100 requests per windowMs
    },
    STRICT: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 10 // limit each IP to 10 requests per windowMs
    }
};

// Export all constants as default
export default {
    TRANSACTION_TYPES,
    PRODUCT_UNITS,
    USER_ROLES,
    USER_STATUS,
    HTTP_STATUS,
    MESSAGES,
    PAGINATION,
    SORT_ORDER,
    STOCK_LEVELS,
    DATABASE_CONSTRAINTS,
    VALIDATION_PATTERNS,
    CACHE_KEYS,
    CACHE_TTL,
    DATE_FORMATS,
    ENVIRONMENTS,
    FILE_UPLOAD,
    RATE_LIMITS
};
