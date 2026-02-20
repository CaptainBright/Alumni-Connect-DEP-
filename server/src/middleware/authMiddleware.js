const jwt = require('jsonwebtoken');

exports.protect = (req, res, next) => {
    const token = req.cookies.session_token;

    if (!token) {
        return res.status(401).json({ message: "Not authorized" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired session" });
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'Admin' || req.user.role === 'admin')) {
        next();
    } else {
        res.status(403).json({ message: 'Admin access required' });
    }
};
