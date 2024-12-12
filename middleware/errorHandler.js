const logger = require('../utils/logger');

module.exports = (err, req, res, next) => {
    logger.error(`Unhandled Error: ${{err.message}}`);
    res.status(500).json({ error: 'Something went wrong!' });
};
