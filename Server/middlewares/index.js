// Authentication middlewares
export { authenticate, optionalAuthenticate } from './auth.middleware.js';

// Authorization middlewares
export {
    allowRoles,
    adminOnly,
    adminOrManager,
    allUsers,
    ownerOrAdmin,
    canPerformAction
} from './authorization.middleware.js';

// Error handling middlewares
export { errorHandler, notFoundHandler, asyncHandler } from './error.middleware.js';

// Security middlewares
export {
    corsMiddleware,
    securityHeaders,
    sanitizeInput,
    ipWhitelist,
    requestSizeLimit,
    requestLogger,
    maintenanceMode
} from './security.middleware.js';

// Rate limiting middlewares
export {
    generalRateLimit,
    strictRateLimit,
    authRateLimit,
    passwordResetRateLimit,
    emailVerificationRateLimit,
    uploadRateLimit,
    bulkOperationRateLimit,
    reportRateLimit
} from './rateLimit.middleware.js';

// Validation middlewares
export {
    validate,
    userValidation,
    productValidation,
    categoryValidation,
    inventoryValidation,
    paginationValidation,
    validateId
} from './validation.middleware.js';

// Main middleware configuration
export { useMiddlewares, useErrorMiddlewares } from './use-middlewares.js';

// Default export for backward compatibility
export { default } from './use-middlewares.js';
