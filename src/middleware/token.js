const jwt = require('jsonwebtoken');
require('dotenv').config();

// Middleware for JWT authorization and role-based access control
const authorize = (requiredRole) => {
  return (req, res, next) => {
    // Get the token from the request header
    const token = req.headers['authorization'];

    // Check if the token exists
    if (!token) {
      return res.status(401).json({ message: 'Access Denied. No token provided.' });
    }

    // Verify the token
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using the secret
      req.user = decoded; // Attach the decoded user info to the request

      // Role-based authorization
      if (requiredRole && decoded.role !== requiredRole) {
        return res.status(403).json({ message: `Access Denied. Requires ${requiredRole} privileges.` });
      }

      next(); // Proceed to the next middleware or route handler
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };
};

module.exports = authorize;
