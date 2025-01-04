const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';  // 本番環境では必ず環境変数から取得すること

exports.generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            role: user.role 
        }, 
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

exports.verifyToken = (token) => {
    return jwt.verify(token, JWT_SECRET);
};
