import { Op } from 'sequelize';
import { PAGINATION, SORT_ORDER } from '../constant/index.js';

/**
 * Database helper utility functions
 */
class DatabaseUtil {

    /**
     * Build where clause for search functionality
     * @param {string} search - Search term
     * @param {Array} searchFields - Fields to search in
     * @returns {Object} Sequelize where clause
     */
    static buildSearchClause(search, searchFields = []) {
        if (!search || !searchFields.length) return {};

        const searchConditions = searchFields.map(field => ({
            [field]: { [Op.iLike]: `%${search.trim()}%` }
        }));

        return { [Op.or]: searchConditions };
    }

    /**
     * Build pagination options
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Object} Pagination options
     */
    static buildPagination(page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT) {
        const pageNum = Math.max(1, parseInt(page) || PAGINATION.DEFAULT_PAGE);
        const limitNum = Math.min(
            PAGINATION.MAX_LIMIT,
            Math.max(PAGINATION.MIN_LIMIT, parseInt(limit) || PAGINATION.DEFAULT_LIMIT)
        );

        return {
            offset: (pageNum - 1) * limitNum,
            limit: limitNum
        };
    }

    /**
     * Build sorting options
     * @param {string} sortBy - Field to sort by
     * @param {string} sortOrder - Sort order (ASC/DESC)
     * @returns {Array} Sequelize order array
     */
    static buildSorting(sortBy = 'created_at', sortOrder = SORT_ORDER.DESC) {
        const validOrder = [SORT_ORDER.ASC, SORT_ORDER.DESC].includes(sortOrder.toUpperCase())
            ? sortOrder.toUpperCase()
            : SORT_ORDER.DESC;

        return [[sortBy, validOrder]];
    }

    /**
     * Build date range filter
     * @param {string} startDate - Start date
     * @param {string} endDate - End date
     * @param {string} field - Date field name
     * @returns {Object} Date range filter
     */
    static buildDateRangeFilter(startDate, endDate, field = 'created_at') {
        const dateFilter = {};

        if (startDate && endDate) {
            dateFilter[field] = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else if (startDate) {
            dateFilter[field] = {
                [Op.gte]: new Date(startDate)
            };
        } else if (endDate) {
            dateFilter[field] = {
                [Op.lte]: new Date(endDate)
            };
        }

        return dateFilter;
    }

    /**
     * Build numeric range filter
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {string} field - Field name
     * @returns {Object} Numeric range filter
     */
    static buildNumericRangeFilter(min, max, field) {
        const rangeFilter = {};

        if (min !== null && min !== undefined && max !== null && max !== undefined) {
            rangeFilter[field] = {
                [Op.between]: [min, max]
            };
        } else if (min !== null && min !== undefined) {
            rangeFilter[field] = {
                [Op.gte]: min
            };
        } else if (max !== null && max !== undefined) {
            rangeFilter[field] = {
                [Op.lte]: max
            };
        }

        return rangeFilter;
    }

    /**
     * Build IN filter for array values
     * @param {Array} values - Array of values
     * @param {string} field - Field name
     * @returns {Object} IN filter
     */
    static buildInFilter(values, field) {
        if (!values || !Array.isArray(values) || values.length === 0) {
            return {};
        }

        return {
            [field]: { [Op.in]: values }
        };
    }

    /**
     * Build boolean filter
     * @param {boolean} value - Boolean value
     * @param {string} field - Field name
     * @returns {Object} Boolean filter
     */
    static buildBooleanFilter(value, field) {
        if (value === null || value === undefined) {
            return {};
        }

        return {
            [field]: Boolean(value)
        };
    }

    /**
     * Combine multiple filter conditions
     * @param {Array} conditions - Array of filter conditions
     * @param {string} operator - Logical operator ('AND' or 'OR')
     * @returns {Object} Combined filter conditions
     */
    static combineFilters(conditions, operator = 'AND') {
        const validConditions = conditions.filter(condition =>
            condition && Object.keys(condition).length > 0
        );

        if (validConditions.length === 0) return {};
        if (validConditions.length === 1) return validConditions[0];

        const opKey = operator === 'OR' ? Op.or : Op.and;
        return { [opKey]: validConditions };
    }

    /**
     * Build include options for associations
     * @param {Array} includes - Array of include configurations
     * @returns {Array} Sequelize include array
     */
    static buildIncludes(includes = []) {
        return includes.map(include => {
            if (typeof include === 'string') {
                return { association: include };
            }

            return {
                association: include.association,
                attributes: include.attributes || undefined,
                where: include.where || undefined,
                required: include.required || false,
                include: include.include ? this.buildIncludes(include.include) : undefined
            };
        });
    }

    /**
     * Calculate pagination metadata
     * @param {number} total - Total number of records
     * @param {number} page - Current page
     * @param {number} limit - Items per page
     * @returns {Object} Pagination metadata
     */
    static calculatePaginationMeta(total, page, limit) {
        const totalPages = Math.ceil(total / limit);
        const hasNextPage = page < totalPages;
        const hasPrevPage = page > 1;

        return {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            total_pages: totalPages,
            has_next_page: hasNextPage,
            has_prev_page: hasPrevPage,
            next_page: hasNextPage ? page + 1 : null,
            prev_page: hasPrevPage ? page - 1 : null
        };
    }

    /**
     * Build query options from request parameters
     * @param {Object} params - Request parameters
     * @param {Object} config - Configuration options
     * @returns {Object} Query options
     */
    static buildQueryOptions(params, config = {}) {
        const {
            searchFields = [],
            sortableFields = ['created_at'],
            defaultSort = 'created_at',
            defaultOrder = SORT_ORDER.DESC,
            includes = []
        } = config;

        const {
            page,
            limit,
            search,
            sort_by,
            sort_order,
            start_date,
            end_date,
            ...filters
        } = params;

        // Build where clause
        const whereConditions = [];

        // Add search condition
        if (search && searchFields.length > 0) {
            whereConditions.push(this.buildSearchClause(search, searchFields));
        }

        // Add date range filter
        if (start_date || end_date) {
            whereConditions.push(this.buildDateRangeFilter(start_date, end_date));
        }

        // Add other filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                if (Array.isArray(value)) {
                    whereConditions.push(this.buildInFilter(value, key));
                } else if (typeof value === 'boolean') {
                    whereConditions.push(this.buildBooleanFilter(value, key));
                } else {
                    whereConditions.push({ [key]: value });
                }
            }
        });

        return {
            where: this.combineFilters(whereConditions),
            ...this.buildPagination(page, limit),
            order: this.buildSorting(
                sortableFields.includes(sort_by) ? sort_by : defaultSort,
                sort_order || defaultOrder
            ),
            include: this.buildIncludes(includes),
            distinct: true
        };
    }

    /**
     * Handle database transaction wrapper
     * @param {Function} callback - Function to execute in transaction
     * @param {Object} sequelize - Sequelize instance
     * @returns {Promise} Transaction result
     */
    static async withTransaction(callback, sequelize) {
        const transaction = await sequelize.transaction();

        try {
            const result = await callback(transaction);
            await transaction.commit();
            return result;
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    /**
     * Batch create with validation
     * @param {Object} Model - Sequelize model
     * @param {Array} data - Array of data to create
     * @param {Object} options - Creation options
     * @returns {Promise} Created records
     */
    static async batchCreate(Model, data, options = {}) {
        const {
            batchSize = 100,
            validate = true,
            ignoreDuplicates = false
        } = options;

        const results = [];

        for (let i = 0; i < data.length; i += batchSize) {
            const batch = data.slice(i, i + batchSize);

            const batchResult = await Model.bulkCreate(batch, {
                validate,
                ignoreDuplicates,
                returning: true
            });

            results.push(...batchResult);
        }

        return results;
    }

    /**
     * Batch update with conditions
     * @param {Object} Model - Sequelize model
     * @param {Object} updateData - Data to update
     * @param {Object} whereCondition - Where condition
     * @returns {Promise} Update result
     */
    static async batchUpdate(Model, updateData, whereCondition) {
        return await Model.update(updateData, {
            where: whereCondition,
            returning: true
        });
    }

    /**
     * Soft delete records
     * @param {Object} Model - Sequelize model
     * @param {Object} whereCondition - Where condition
     * @param {string} deletedField - Name of the deleted flag field
     * @returns {Promise} Update result
     */
    static async softDelete(Model, whereCondition, deletedField = 'is_active') {
        return await Model.update(
            { [deletedField]: false },
            { where: whereCondition }
        );
    }
}

export default DatabaseUtil;
