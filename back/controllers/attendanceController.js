
const Attendance = require("../models/attendanceModel");
const mongoose = require("mongoose");
const PayRoll = require("../models/payRollModel");
const Company = require("../models/companyModel"); // ✅ new

// Helper to calculate hours worked
function calculateHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const [inH, inM] = clockIn.split(":").map(Number);
  const [outH, outM] = clockOut.split(":").map(Number);
  return ((outH + outM / 60) - (inH + inM / 60)).toFixed(2);
}

function getMonthName(monthNumber) {
  const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
  ];
  return months[monthNumber - 1];
}

// ------------------- GET ATTENDANCE -------------------

const getAttendance = async (req, res) => {
  try {
    const { month, year, companyId } = req.query;

    if (!month || !year || !companyId)
      return res.status(400).json({ error: "Month, year, and companyId required" });

    const monthNum = Number(month);
    const yearNum = Number(year);

    if (!monthNum || !yearNum || monthNum < 1 || monthNum > 12) {
      return res.status(400).json({ error: "Valid month and year required" });
    }

    // Validate company
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Invalid companyId" });

    const startDate = new Date(yearNum, monthNum - 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(yearNum, monthNum, 0);
    endDate.setHours(23, 59, 59, 999);

    let query = { date: { $gte: startDate, $lte: endDate }, createdBy: company._id };

    if (req?.user?.role === "employee") {
      query.userId = req.user.id;
    }

    const records = await Attendance.find(query)
      .populate("userId", "fullName profileImage")
      .sort({ date: 1 });

    const payrolls = await PayRoll.find({
      employeeId: { $in: records.map(r => r?.userId?._id) },
      month: getMonthName(monthNum),
      year: yearNum,
    });

    res.json({ records, payrolls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};




// ------------------- CLOCK IN -------------------
const clockIn = async (req, res) => {
  try {
    const {  userId } = req.params;
    const { companyId } = req.body; // frontend sends companyId here

    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Invalid companyId" });

    const now = new Date();
    const todayISO = now.toISOString().split("T")[0];
    const startOfDay = new Date(todayISO + "T00:00:00.000Z");
    const endOfDay = new Date(todayISO + "T23:59:59.999Z");

    let attendance = await Attendance.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      createdBy: company._id,
    });

    if (attendance && attendance.clockIn && attendance.clockIn !== "-") {
      return res.status(400).json({ error: "Already clocked in today" });
    }

    const clockInTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes().toString().padStart(2, "0")}`;

    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: now,
        clockIn: clockInTime,
        status: "Clocked In",
        createdBy: company._id,
      });
    } else {
      attendance.clockIn = clockInTime;
      attendance.status = "Clocked In";
    }

    await attendance.save();
    res.json({ message: "Clocked in successfully", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------- CLOCK OUT -------------------
const clockOut = async (req, res) => {
  try {
    const { userId } = req.params;
    const { companyId } = req.body;
    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Invalid companyId" });

    const now = new Date();
    const todayISO = now.toISOString().split("T")[0];
    const startOfDay = new Date(todayISO + "T00:00:00.000Z");
    const endOfDay = new Date(todayISO + "T23:59:59.999Z");

    const attendance = await Attendance.findOne({
      userId,
      date: { $gte: startOfDay, $lte: endOfDay },
      createdBy: company._id,
    });

    if (!attendance || !attendance.clockIn || attendance.clockIn === "-") {
      return res.status(400).json({ error: "You haven't clocked in yet" });
    }

    if (attendance.clockOut && attendance.clockOut !== "-") {
      return res.status(400).json({ error: "Already clocked out today" });
    }

    const clockOutTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes().toString().padStart(2, "0")}`;
    const hoursWorked = calculateHours(attendance.clockIn, clockOutTime);

    let status = "Present";
    if (hoursWorked < 4) status = "Half Day";
    else if (hoursWorked < 8) status = "Late";

    attendance.clockOut = clockOutTime;
    attendance.hoursWorked = hoursWorked;
    attendance.status = status;

    await attendance.save();
    res.json({ message: "Clocked out successfully", attendance });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  getAttendance,
  clockIn,
  clockOut,
};
