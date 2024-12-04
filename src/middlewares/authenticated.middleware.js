const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const bearerToken = req.headers['authorization'];
    if (!bearerToken) {
        return res.status(401).json({ message: 'Token de autenticación no proporcionado.' });
    }

    const token = bearerToken.replace('Bearer ', '');
    
    jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token de autenticación inválido.' });
        }
        req.user = user;
        next();
    });
};

module.exports = { authenticateToken }