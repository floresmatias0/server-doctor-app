const jwt = require('jsonwebtoken');
const {JWT_SECRET} = process.env;

const verifyToken = (req, res, next) => {
  
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ message: 'No token provided' });
  
    jwt.verify(token, JWT_SECRET, (err, decoded) => {

      if (err) return res.status(401).json({ message: 'Invalid token' });
      req.userId = decoded.id;
      next();
    });
};

module.exports = {
    verifyToken
}