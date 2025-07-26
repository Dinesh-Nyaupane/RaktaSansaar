const jwt = require('jsonwebtoken');

// Middleware to verify token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', ''); // Check if the token is present

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify token
    req.user = decoded.user; // Attach user info to request
    next(); // Proceed to the next middleware or route handler
  } catch (err) {
    return res.status(401).json({ message: 'Token is not valid' });
  }
};

module.exports = verifyToken;
