const authorize = (roles = []) => {
    // rolesは単一の文字列または文字列の配列
    if (typeof roles === 'string') {
        roles = [roles];
    }

    return [
        (req, res, next) => {
            if (!req.user || (roles.length && !roles.includes(req.user.role))) {
                return res.status(403).json({ error: 'Forbidden' });
            }
            next();
        }
    ];
};

module.exports = authorize;
