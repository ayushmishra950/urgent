const jwt = require("jsonwebtoken");

// JWT secret (load from env or default)
const JWT_SECRET = process.env.JWT_SECRET || "secret_key";

/**
 * Generate JWT token for a user/admin
 * @param {Object} payload - Data to include in token (e.g., id, email, role)
 * @param {String|Number} expiresIn - Token expiry, e.g., "1d", "2h"
 * @returns {String} JWT token
 */
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn : "7d" });
}

module.exports = { generateToken };
