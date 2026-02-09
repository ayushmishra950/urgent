const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

const authMiddleware = (req, res, next) => {
  try {
    // Header se token lo
    const authHeader = req.headers.authorization;

    // Check header exists or not
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "Access denied. No token provided"
      });
    }

    // Bearer TOKEN_VALUE
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    // Attach user/admin info to request
    req.user = decoded;

    next(); // allow request
  } catch (error) {
    console.error(error);
    return res.status(401).json({
      message: "Invalid or expired token"
    });
  }
};

module.exports = {authMiddleware};
