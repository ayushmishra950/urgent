const jwt = require("jsonwebtoken");
const {Admin} = require("../models/authModel");
const {Employee} = require("../models/employeeModel");

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // 🔐 Verify Access Token
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    // 🔍 Find user (Admin or Employee)
    let user =
      await Admin.findById(decoded.id).populate("companyId", "name logo") ||
      await Employee.findById(decoded.id).populate("createdBy", "name logo");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      role: decoded.role,
      companyId: decoded.companyId || null,
    };

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Access token expired" });
    }

    return res.status(403).json({ message: "Invalid token" });
  }
};

module.exports = authMiddleware;
