
const Attendance = require("../models/attendanceModel");
const mongoose = require("mongoose");
const PayRoll = require("../models/payRollModel");
const Company = require("../models/companyModel"); // ✅ new
const {sendNotification } = require("../socketHelpers");
const { Employee } = require("../models/employeeModel");
const recentActivity = require("../models/recentActivityModel.js");

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
      month: getMonthName(monthNum).toLowerCase(),
      year: yearNum.toString(),
    });

    res.json({ records, payrolls });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};




// // ------------------- CLOCK IN -------------------
// const clockIn = async (req, res) => {
//   try {
//     const {  userId } = req.params;
//     const { companyId } = req.body; // frontend sends companyId here

//     if (!companyId) return res.status(400).json({ error: "companyId is required" });

//     const company = await Company.findById(companyId);
//     if (!company) return res.status(404).json({ error: "Invalid companyId" });

//      const user = await Employee.findOne({_id:userId, createdBy:companyId});
//     if (!user) return res.status(404).json({ error: "User Not Found." });

//     const now = new Date();
//     const todayISO = now.toISOString().split("T")[0];
//     const startOfDay = new Date(todayISO + "T00:00:00.000Z");
//     const endOfDay = new Date(todayISO + "T23:59:59.999Z");

//     let attendance = await Attendance.findOne({
//       userId,
//       date: { $gte: startOfDay, $lte: endOfDay },
//       createdBy: company._id,
//     });

//     if (attendance && attendance.clockIn && attendance.clockIn !== "-") {
//       return res.status(400).json({ error: "Already clocked in today" });
//     }

//     const clockInTime = `${now.getHours().toString().padStart(2, "0")}:${now
//       .getMinutes().toString().padStart(2, "0")}`;

//     if (!attendance) {
//       attendance = new Attendance({
//         userId,
//         date: now,
//         clockIn: clockInTime,
//         status: "Clocked In",
//         createdBy: company._id,
//       });
//     } else {
//       attendance.clockIn = clockInTime;
//       attendance.status = "Clocked In";
//     }

//     await attendance.save();

//      await recentActivity.create({title:`Login Successfully.`, createdBy:userId, createdByRole:"Employee", companyId:company?._id});
    
//            await sendNotification({
//            createdBy: userId,
         
//            userId: company?.admins[0] || "69735b496f1896b3b1ceff46",
         
//            userModel: "Employee", // "Admin" or "Employee"
         
//            companyId: companyId,
         
//            message: `Good Morning Login By ${user?.fullName}`,
         
//            type: "attendance",
         
//            referenceId: attendance._id
//          });

    
//     res.json({ message: "Clocked in successfully", attendance });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// // ------------------- CLOCK OUT -------------------
// const clockOut = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { companyId } = req.body;
//     if (!companyId) return res.status(400).json({ error: "companyId is required" });

//     const company = await Company.findById(companyId);
//     if (!company) return res.status(404).json({ error: "Invalid companyId" });

//       const user = await Employee.findOne({_id:userId, createdBy:companyId});
//     if (!user) return res.status(404).json({ error: "User Not Found." });


//     const now = new Date();
//     const todayISO = now.toISOString().split("T")[0];
//     const startOfDay = new Date(todayISO + "T00:00:00.000Z");
//     const endOfDay = new Date(todayISO + "T23:59:59.999Z");

//     const attendance = await Attendance.findOne({
//       userId,
//       date: { $gte: startOfDay, $lte: endOfDay },
//       createdBy: company._id,
//     });

//     if (!attendance || !attendance.clockIn || attendance.clockIn === "-") {
//       return res.status(400).json({ error: "You haven't clocked in yet" });
//     }

//     if (attendance.clockOut && attendance.clockOut !== "-") {
//       return res.status(400).json({ error: "Already clocked out today" });
//     }

//     const clockOutTime = `${now.getHours().toString().padStart(2, "0")}:${now
//       .getMinutes().toString().padStart(2, "0")}`;
//     const hoursWorked = calculateHours(attendance.clockIn, clockOutTime);

//     let status = "Present";
//     if (hoursWorked < 4) status = "Half Day";
//     else if (hoursWorked < 8) status = "Late";

//     attendance.clockOut = clockOutTime;
//     attendance.hoursWorked = hoursWorked;
//     attendance.status = status;

//     await attendance.save();


//      await recentActivity.create({title:`Login Successfully.`, createdBy:userId, createdByRole:"Employee", companyId:company?._id});
    
//            await sendNotification({
//            createdBy: userId,
         
//            userId: company?.admins[0]  || "69735b496f1896b3b1ceff46",
         
//            userModel: "Employee", // "Admin" or "Employee"
         
//            companyId: companyId,
         
//            message: `Good Evening Logout By ${user?.fullName}`,
         
//            type: "attendance",
         
//            referenceId: attendance._id
//          });
//     res.json({ message: "Clocked out successfully", attendance });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };
















// ------------------- CLOCK IN -------------------
const clockIn = async (req, res) => {
  try {
    const { userId } = req.params;
    const { companyId } = req.body;

    if (!companyId) return res.status(400).json({ error: "companyId is required" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Invalid companyId" });

    const user = await Employee.findOne({ _id: userId, createdBy: companyId });
    if (!user) return res.status(404).json({ error: "User Not Found." });

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
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;

    // ----------------- Determine status based on company rules -----------------
    const rules = company.attendanceRules || {};
    const expectedClockIn = rules.clockInTime || "09:00"; // default 9 AM
    const [expectedHour, expectedMin] = expectedClockIn.split(":").map(Number);

    const expectedDate = new Date(attendance?.date || now);
    expectedDate.setHours(expectedHour, expectedMin, 0, 0);

    let status = "Clocked In";
    if (now > expectedDate) status = "Late"; // late if clock-in after expected

    // --------------------------------------------------------------------------

    if (!attendance) {
      attendance = new Attendance({
        userId,
        date: now,
        clockIn: clockInTime,
        status,
        createdBy: company._id,
      });
    } else {
      attendance.clockIn = clockInTime;
      attendance.status = status;
    }

    await attendance.save();

    await recentActivity.create({
      title: `Login Successfully.`,
      createdBy: userId,
      createdByRole: "Employee",
      companyId: company._id,
    });

    await sendNotification({
      createdBy: userId,
      userId: company?.admins[0] || "69735b496f1896b3b1ceff46",
      userModel: "Employee",
      companyId: companyId,
      message: `Good Morning Login By ${user?.fullName}`,
      type: "attendance",
      referenceId: attendance._id,
    });

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

    const user = await Employee.findOne({ _id: userId, createdBy: companyId });
    if (!user) return res.status(404).json({ error: "User Not Found." });

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
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
    const hoursWorked = calculateHours(attendance.clockIn, clockOutTime);

    // ----------------- Determine status based on company rules -----------------
    const rules = company.attendanceRules || {};
    const expectedClockIn = rules.clockInTime || "09:00";
    const fullDayHours = rules.fullDayHours || 8;
    const halfDayHours = rules.halfDayHours || 4;

    // Check Late based on clock-in time
    const [expectedHour, expectedMin] = expectedClockIn.split(":").map(Number);
    const expectedDate = new Date(attendance.date);
    expectedDate.setHours(expectedHour, expectedMin, 0, 0);

    const [inHour, inMin] = attendance.clockIn.split(":").map(Number);
    const actualClockIn = new Date(attendance.date);
    actualClockIn.setHours(inHour, inMin, 0, 0);

    let status = "Present";
    if (actualClockIn > expectedDate) status = "Late";

    // Check based on hours worked
    if (hoursWorked < halfDayHours) status = "Half Day";
    else if (hoursWorked >= halfDayHours && hoursWorked < fullDayHours) status = "Late";
    else status = "Present";
    // --------------------------------------------------------------------------

    attendance.clockOut = clockOutTime;
    attendance.hoursWorked = hoursWorked;
    attendance.status = status;

    await attendance.save();

    await recentActivity.create({
      title: `Logout Successfully.`,
      createdBy: userId,
      createdByRole: "Employee",
      companyId: company._id,
    });

    await sendNotification({
      createdBy: userId,
      userId: company?.admins[0] || "69735b496f1896b3b1ceff46",
      userModel: "Employee",
      companyId: companyId,
      message: `Good Evening Logout By ${user?.fullName}`,
      type: "attendance",
      referenceId: attendance._id,
    });

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
