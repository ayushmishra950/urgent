const express = require("express");
const router = express.Router();
const attendanceController = require("../controllers/attendanceController");
// const { authMiddleware } = require("../middlewares/auth");

// Get attendance (Admin: all, Employee: self)
router.get("/",  attendanceController.getAttendance);

// Clock In (Employee only)
router.post("/clock-in/:userId", attendanceController.clockIn);

// Clock Out (Employee only)
router.post("/clock-out/:userId", attendanceController.clockOut);

module.exports = router;
