const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.printf(({ timestamp, level, message }) => {
            // オブジェクトの場合はJSONに変換
            const formattedMessage = typeof message === 'object' 
                ? JSON.stringify(message, null, 2) 
                : message;
            
            return `[${timestamp}] ${level.toUpperCase()}: ${formattedMessage}`;
        })
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});

module.exports = logger;
