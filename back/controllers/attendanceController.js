
// const Attendance = require("../models/attendanceModel");
// const mongoose = require("mongoose");
// const PayRoll = require("../models/payRollModel");
// const Company = require("../models/companyModel"); // ✅ new
// const { sendNotification } = require("../socketHelpers");
// const { Employee } = require("../models/employeeModel");
// const recentActivity = require("../models/recentActivityModel.js");
// const { Admin } = require("../models/authModel.js");

// // Helper to calculate hours worked
// function calculateHours(clockIn, clockOut) {
//   if (!clockIn || !clockOut) return 0;
//   const [inH, inM] = clockIn.split(":").map(Number);
//   const [outH, outM] = clockOut.split(":").map(Number);
//   return ((outH + outM / 60) - (inH + inM / 60)).toFixed(2);
// }

// function getMonthName(monthNumber) {
//   const months = [
//     "January", "February", "March", "April",
//     "May", "June", "July", "August",
//     "September", "October", "November", "December"
//   ];
//   return months[monthNumber - 1];
// }

// // ------------------- GET ATTENDANCE -------------------

// const getAttendance = async (req, res) => {
//   try {
//     const { month, year, companyId } = req.query;

//     if (!month || !year || !companyId)
//       return res.status(400).json({ error: "Month, year, and companyId required" });

//     const monthNum = Number(month);
//     const yearNum = Number(year);

//     if (!monthNum || !yearNum || monthNum < 1 || monthNum > 12) {
//       return res.status(400).json({ error: "Valid month and year required" });
//     }

//     // Validate company
//     const company = await Company.findById(companyId);
//     if (!company) return res.status(404).json({ error: "Invalid companyId" });

//     const startDate = new Date(yearNum, monthNum - 1, 1);
//     startDate.setHours(0, 0, 0, 0);
//     const endDate = new Date(yearNum, monthNum, 0);
//     endDate.setHours(23, 59, 59, 999);

//     let query = { date: { $gte: startDate, $lte: endDate }, createdBy: company._id };

//     if (req?.user?.role === "employee") {
//       query.userId = req.user.id;
//     }

//     const records = await Attendance.find(query)
//       .populate("userId", "fullName profileImage")
//       .sort({ date: 1 });

//     const payrolls = await PayRoll.find({
//       employeeId: { $in: records.map(r => r?.userId?._id) },
//       month: getMonthName(monthNum).toLowerCase(),
//       year: yearNum.toString(),
//     });

//     res.json({ records, payrolls });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };

// const getAttendanceByDay = async (req, res) => {
//   try {
//     const { companyId, adminId, date, userId } = req.query;
//     if (!companyId, adminId, !date) return res.status(400).json({ message: "required data missing." });

//     const company = await Company.findOne({ _id: companyId });
//     if (!company) return res.status(404).json({ message: "Company Not Found." });

//     const admin = await Admin.findOne({ _id: adminId, companyId });
//     if (!admin) return res.status(404).json({ message: "You Are Not Authorized." });

//     const employee = await Employee.findOne({ _id: userId, createdBy: companyId });
//     if (!employee) return res.status(404).json({ message: "Employee Not Found." });


//     const selectedDate = new Date(date);
//     const nextDay = new Date(selectedDate);
//     nextDay.setDate(selectedDate.getDate() + 1);

//     const attendance = await Attendance.findOne({
//       createdBy: companyId, userId, date: {
//         $gte: selectedDate,
//         $lt: nextDay
//       }
//     })
//     if (!attendance) return res.status(404).json({ message: "Attendance Data Not Found." });

//     res.status(200).json({ attendance, message: "Attendance Data successfully Fetch." });
//   }
//   catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// }


// const updateAttendanceByDay = async (req, res) => {
//   try {
//     const { companyId, adminId, date, userId, startTime, endTime } = req.body;

//     if (!companyId || !adminId || !date || !startTime || !endTime) {
//       return res.status(400).json({ message: "Required data missing." });
//     }

//     const company = await Company.findById(companyId);
//     if (!company) return res.status(404).json({ message: "Company Not Found." });

//     const admin = await Admin.findOne({ _id: adminId, companyId });
//     if (!admin) return res.status(404).json({ message: "You Are Not Authorized." });

//     const employee = await Employee.findOne({ _id: userId, createdBy: companyId });
//     if (!employee) return res.status(404).json({ message: "Employee Not Found." });

//     const selectedDate = new Date(date);
//     const nextDay = new Date(selectedDate);
//     nextDay.setDate(selectedDate.getDate() + 1);

//     const attendance = await Attendance.findOne({
//       createdBy: companyId,
//       userId,
//       date: {
//         $gte: selectedDate,
//         $lt: nextDay,
//       },
//     });

//     if (!attendance) {
//       return res.status(404).json({ message: "Attendance Data Not Found." });
//     }

//     // ---------------- Format validation (HH:mm) ----------------
//     const formatTime = (time) => {
//       const [hour, minute] = time.split(":");
//       return `${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
//     };

//     const formattedStart = formatTime(startTime);
//     const formattedEnd = formatTime(endTime);

//     // ---------------- Update clockIn & clockOut ----------------
//     attendance.clockIn = formattedStart;
//     attendance.clockOut = formattedEnd;

//     // ---------------- Status Calculation ----------------
//     const rules = company.attendanceRules || {};
//     const expectedClockIn = rules.clockInTime || "09:00";

//     const [expectedHour, expectedMin] = expectedClockIn.split(":").map(Number);

//     const expectedDate = new Date(selectedDate);
//     expectedDate.setHours(expectedHour, expectedMin, 0, 0);

//     const [startHour, startMin] = formattedStart.split(":").map(Number);
//     const actualStart = new Date(selectedDate);
//     actualStart.setHours(startHour, startMin, 0, 0);

//     let status = "Present";

//     if (actualStart > expectedDate) {
//       status = "Late";
//     }

//     attendance.status = status;

//     await attendance.save();

//     res.status(200).json({
//       attendance,
//       message: "Attendance Updated Successfully.",
//     });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };





// // // ------------------- CLOCK IN -------------------
// // const clockIn = async (req, res) => {
// //   try {
// //     const {  userId } = req.params;
// //     const { companyId } = req.body; // frontend sends companyId here

// //     if (!companyId) return res.status(400).json({ error: "companyId is required" });

// //     const company = await Company.findById(companyId);
// //     if (!company) return res.status(404).json({ error: "Invalid companyId" });

// //      const user = await Employee.findOne({_id:userId, createdBy:companyId});
// //     if (!user) return res.status(404).json({ error: "User Not Found." });

// //     const now = new Date();
// //     const todayISO = now.toISOString().split("T")[0];
// //     const startOfDay = new Date(todayISO + "T00:00:00.000Z");
// //     const endOfDay = new Date(todayISO + "T23:59:59.999Z");

// //     let attendance = await Attendance.findOne({
// //       userId,
// //       date: { $gte: startOfDay, $lte: endOfDay },
// //       createdBy: company._id,
// //     });

// //     if (attendance && attendance.clockIn && attendance.clockIn !== "-") {
// //       return res.status(400).json({ error: "Already clocked in today" });
// //     }

// //     const clockInTime = `${now.getHours().toString().padStart(2, "0")}:${now
// //       .getMinutes().toString().padStart(2, "0")}`;

// //     if (!attendance) {
// //       attendance = new Attendance({
// //         userId,
// //         date: now,
// //         clockIn: clockInTime,
// //         status: "Clocked In",
// //         createdBy: company._id,
// //       });
// //     } else {
// //       attendance.clockIn = clockInTime;
// //       attendance.status = "Clocked In";
// //     }

// //     await attendance.save();

// //      await recentActivity.create({title:`Login Successfully.`, createdBy:userId, createdByRole:"Employee", companyId:company?._id});

// //            await sendNotification({
// //            createdBy: userId,

// //            userId: company?.admins[0] || "69735b496f1896b3b1ceff46",

// //            userModel: "Employee", // "Admin" or "Employee"

// //            companyId: companyId,

// //            message: `Good Morning Login By ${user?.fullName}`,

// //            type: "attendance",

// //            referenceId: attendance._id
// //          });


// //     res.json({ message: "Clocked in successfully", attendance });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };

// // // ------------------- CLOCK OUT -------------------
// // const clockOut = async (req, res) => {
// //   try {
// //     const { userId } = req.params;
// //     const { companyId } = req.body;
// //     if (!companyId) return res.status(400).json({ error: "companyId is required" });

// //     const company = await Company.findById(companyId);
// //     if (!company) return res.status(404).json({ error: "Invalid companyId" });

// //       const user = await Employee.findOne({_id:userId, createdBy:companyId});
// //     if (!user) return res.status(404).json({ error: "User Not Found." });


// //     const now = new Date();
// //     const todayISO = now.toISOString().split("T")[0];
// //     const startOfDay = new Date(todayISO + "T00:00:00.000Z");
// //     const endOfDay = new Date(todayISO + "T23:59:59.999Z");

// //     const attendance = await Attendance.findOne({
// //       userId,
// //       date: { $gte: startOfDay, $lte: endOfDay },
// //       createdBy: company._id,
// //     });

// //     if (!attendance || !attendance.clockIn || attendance.clockIn === "-") {
// //       return res.status(400).json({ error: "You haven't clocked in yet" });
// //     }

// //     if (attendance.clockOut && attendance.clockOut !== "-") {
// //       return res.status(400).json({ error: "Already clocked out today" });
// //     }

// //     const clockOutTime = `${now.getHours().toString().padStart(2, "0")}:${now
// //       .getMinutes().toString().padStart(2, "0")}`;
// //     const hoursWorked = calculateHours(attendance.clockIn, clockOutTime);

// //     let status = "Present";
// //     if (hoursWorked < 4) status = "Half Day";
// //     else if (hoursWorked < 8) status = "Late";

// //     attendance.clockOut = clockOutTime;
// //     attendance.hoursWorked = hoursWorked;
// //     attendance.status = status;

// //     await attendance.save();


// //      await recentActivity.create({title:`Login Successfully.`, createdBy:userId, createdByRole:"Employee", companyId:company?._id});

// //            await sendNotification({
// //            createdBy: userId,

// //            userId: company?.admins[0]  || "69735b496f1896b3b1ceff46",

// //            userModel: "Employee", // "Admin" or "Employee"

// //            companyId: companyId,

// //            message: `Good Evening Logout By ${user?.fullName}`,

// //            type: "attendance",

// //            referenceId: attendance._id
// //          });
// //     res.json({ message: "Clocked out successfully", attendance });
// //   } catch (err) {
// //     console.error(err);
// //     res.status(500).json({ error: "Server error" });
// //   }
// // };
















// // ------------------- CLOCK IN -------------------
// const clockIn = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     const { companyId } = req.body;

//     if (!companyId) return res.status(400).json({ error: "companyId is required" });

//     const company = await Company.findById(companyId);
//     if (!company) return res.status(404).json({ error: "Invalid companyId" });

//     const user = await Employee.findOne({ _id: userId, createdBy: companyId });
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
//       .getMinutes()
//       .toString()
//       .padStart(2, "0")}`;

//     // ----------------- Determine status based on company rules -----------------
//     const rules = company.attendanceRules || {};
//     const expectedClockIn = rules.clockInTime || "09:00"; // default 9 AM
//     const [expectedHour, expectedMin] = expectedClockIn.split(":").map(Number);

//     const expectedDate = new Date(attendance?.date || now);
//     expectedDate.setHours(expectedHour, expectedMin, 0, 0);

//     let status = "Clocked In";
//     if (now > expectedDate) status = "Late"; // late if clock-in after expected

//     // --------------------------------------------------------------------------

//     if (!attendance) {
//       attendance = new Attendance({
//         userId,
//         date: now,
//         clockIn: clockInTime,
//         status,
//         createdBy: company._id,
//       });
//     } else {
//       attendance.clockIn = clockInTime;
//       attendance.status = status;
//     }

//     await attendance.save();

//     await recentActivity.create({
//       title: `Login Successfully.`,
//       createdBy: userId,
//       createdByRole: "Employee",
//       companyId: company._id,
//     });

//     await sendNotification({
//       createdBy: userId,
//       userId: company?.admins[0] || "69735b496f1896b3b1ceff46",
//       userModel: "Employee",
//       companyId: companyId,
//       message: `Good Morning Login By ${user?.fullName}`,
//       type: "attendance",
//       referenceId: attendance._id,
//     });

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

//     const user = await Employee.findOne({ _id: userId, createdBy: companyId });
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
//       .getMinutes()
//       .toString()
//       .padStart(2, "0")}`;
//     const hoursWorked = calculateHours(attendance.clockIn, clockOutTime);

//     // ----------------- Determine status based on company rules -----------------
//     const rules = company.attendanceRules || {};
//     const expectedClockIn = rules.clockInTime || "09:00";
//     const fullDayHours = rules.fullDayHours || 8;
//     const halfDayHours = rules.halfDayHours || 4;

//     // Check Late based on clock-in time
//     const [expectedHour, expectedMin] = expectedClockIn.split(":").map(Number);
//     const expectedDate = new Date(attendance.date);
//     expectedDate.setHours(expectedHour, expectedMin, 0, 0);

//     const [inHour, inMin] = attendance.clockIn.split(":").map(Number);
//     const actualClockIn = new Date(attendance.date);
//     actualClockIn.setHours(inHour, inMin, 0, 0);

//     let status = "Present";
//     if (actualClockIn > expectedDate) status = "Late";

//     // Check based on hours worked
//     if (hoursWorked < halfDayHours) status = "Half Day";
//     else if (hoursWorked >= halfDayHours && hoursWorked < fullDayHours) status = "Late";
//     else status = "Present";
//     // --------------------------------------------------------------------------

//     attendance.clockOut = clockOutTime;
//     attendance.hoursWorked = hoursWorked;
//     attendance.status = status;

//     await attendance.save();

//     await recentActivity.create({
//       title: `Logout Successfully.`,
//       createdBy: userId,
//       createdByRole: "Employee",
//       companyId: company._id,
//     });

//     await sendNotification({
//       createdBy: userId,
//       userId: company?.admins[0] || "69735b496f1896b3b1ceff46",
//       userModel: "Employee",
//       companyId: companyId,
//       message: `Good Evening Logout By ${user?.fullName}`,
//       type: "attendance",
//       referenceId: attendance._id,
//     });

//     res.json({ message: "Clocked out successfully", attendance });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: "Server error" });
//   }
// };


// module.exports = {
//   getAttendance,
//   clockIn,
//   clockOut,
//   getAttendanceByDay
// };


























































const Attendance = require("../models/attendanceModel");
const mongoose = require("mongoose");
const PayRoll = require("../models/payRollModel");
const Company = require("../models/companyModel");
const { sendNotification } = require("../socketHelpers");
const { Employee } = require("../models/employeeModel");
const recentActivity = require("../models/recentActivityModel.js");
const { Admin } = require("../models/authModel.js");
const cron = require("node-cron");

// ---------------- Helper ----------------
function calculateHours(clockIn, clockOut) {
  if (!clockIn || !clockOut) return 0;
  const [inH, inM] = clockIn.split(":").map(Number);
  const [outH, outM] = clockOut.split(":").map(Number);
  return ((outH + outM / 60) - (inH + inM / 60)).toFixed(2);
}

function getMonthName(monthNumber) {
  const months = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];
  return months[monthNumber - 1];
}

function formatTime(time) {
  if (!time) return null;
  const [h, m] = time.split(":");
  return `${h.padStart(2,"0")}:${m.padStart(2,"0")}`;
}

// ------------------- GET ATTENDANCE -------------------
const getAttendance = async (req, res) => {
  try {
    const { month, year, companyId } = req.query;
    if (!month || !year || !companyId)
      return res.status(400).json({ error: "Month, year, and companyId required" });

    const monthNum = Number(month);
    const yearNum = Number(year);
    if (!monthNum || !yearNum || monthNum < 1 || monthNum > 12)
      return res.status(400).json({ error: "Valid month and year required" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ error: "Invalid companyId" });

    const startDate = new Date(yearNum, monthNum - 1, 1);
    startDate.setHours(0,0,0,0);
    const endDate = new Date(yearNum, monthNum, 0);
    endDate.setHours(23,59,59,999);

    let query = { date: { $gte: startDate, $lte: endDate }, createdBy: company._id };
    if (req?.user?.role === "employee") query.userId = req.user.id;

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

// ------------------- GET ATTENDANCE BY DAY -------------------
const getAttendanceByDay = async (req, res) => {
  try {
    const { companyId, adminId, date, userId } = req.query;
    if (!companyId || !adminId || !date)
      return res.status(400).json({ message: "Required data missing." });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company Not Found." });

    const admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) return res.status(404).json({ message: "You Are Not Authorized." });

    const employee = await Employee.findOne({ _id: userId, createdBy: companyId });
    if (!employee) return res.status(404).json({ message: "Employee Not Found." });

    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    const attendance = await Attendance.findOne({
      createdBy: companyId,
      userId,
      date: { $gte: selectedDate, $lt: nextDay },
    });

    // if (!attendance)
    //   return res.status(404).json({ message: "Attendance Data Not Found." });

    res.status(200).json({ attendance, message: "Attendance Data successfully fetched." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// ------------------- UPDATE ATTENDANCE BY DAY -------------------
const updateAttendanceByDay = async (req, res) => {
  try {
    const { companyId, adminId, date, userId, startTime, endTime } = req.body;

    console.log(req.body)

    if (!companyId || !adminId || !date || (!startTime && !endTime))
      return res.status(400).json({ message: "Required data missing." });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company Not Found." });

    const admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) return res.status(404).json({ message: "You Are Not Authorized." });

    const employee = await Employee.findOne({ _id: userId, createdBy: companyId });
    if (!employee) return res.status(404).json({ message: "Employee Not Found." });

    const selectedDate = new Date(date);
    const nextDay = new Date(selectedDate);
    nextDay.setDate(selectedDate.getDate() + 1);

    let attendance = await Attendance.findOne({
      createdBy: companyId,
      userId,
      date: { $gte: selectedDate, $lt: nextDay },
    });

    // if (!attendance)
    //   return res.status(404).json({ message: "Attendance Data Not Found." });

   const formattedStart = startTime ? formatTime(startTime) : (attendance?.clockIn || "");
const formattedEnd = endTime ? formatTime(endTime) : (attendance?.clockOut || "");

if (!attendance) {
  attendance = new Attendance({
    createdBy: companyId,
    userId,
    date: selectedDate,
    clockIn: startTime ? formatTime(startTime) : null,
    clockOut: endTime ? formatTime(endTime) : null,
  });
} else {
  attendance.clockIn = startTime ? formatTime(startTime) : (attendance.clockIn || null);
  attendance.clockOut = endTime ? formatTime(endTime) : (attendance.clockOut || null);
}

     // ------------------- Calculate hoursWorked -------------------
    let hoursWorked = 0;
    if (formattedStart && formattedEnd) {
      const [inH, inM] = formattedStart.split(":").map(Number);
      const [outH, outM] = formattedEnd.split(":").map(Number);
      hoursWorked = ((outH + outM / 60) - (inH + inM / 60)).toFixed(2);
    }
    attendance.hoursWorked = hoursWorked;

    // ------------------- Dynamic Status -------------------
    const rules = company.attendanceRules || {};
    const expectedClockIn = rules.clockInTime || "09:00";
    const fullDayHours = rules.fullDayHours || 8;
    const halfDayHours = rules.halfDayHours || 4;

    let status = "Absent";

    if (formattedStart && !formattedEnd) status = "Half Day";
    else if (formattedStart && formattedEnd) {
      const hoursWorked = calculateHours(formattedStart, formattedEnd);
      if (hoursWorked < halfDayHours) status = "Half Day";
      else if (hoursWorked >= halfDayHours && hoursWorked < fullDayHours) status = "Late";
      else status = "Present";
    }

    // Check Late
    if (formattedStart) {
      const [expH, expM] = expectedClockIn.split(":").map(Number);
      const [inH, inM] = formattedStart.split(":").map(Number);
      const expected = new Date(selectedDate);
      expected.setHours(expH, expM, 0, 0);
      const actual = new Date(selectedDate);
      actual.setHours(inH, inM, 0, 0);
      if (actual > expected) status = "Late";
    }

    attendance.status = status;
    await attendance.save();

    res.status(200).json({ attendance, message: "Attendance Updated Successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

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

    if (attendance && attendance.clockIn) {
      return res.status(400).json({ error: "Already clocked in today" });
    }

    const clockInTime = `${now.getHours().toString().padStart(2, "0")}:${now
      .getMinutes().toString().padStart(2, "0")}`;

    // Status
    const rules = company.attendanceRules || {};
    const expectedClockIn = rules.clockInTime || "09:00";
    const [expH, expM] = expectedClockIn.split(":").map(Number);
    const expected = new Date(now);
    expected.setHours(expH, expM, 0, 0);

    let status = "Clocked In";
    if (now > expected) status = "Late";

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
      companyId,
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
      .getMinutes().toString().padStart(2, "0")}`;

    const hoursWorked = calculateHours(attendance.clockIn, clockOutTime);

    const rules = company.attendanceRules || {};
    const expectedClockIn = rules.clockInTime || "09:00";
    const fullDayHours = rules.fullDayHours || 8;
    const halfDayHours = rules.halfDayHours || 4;

    // Check Late based on clockIn
    const [expH, expM] = expectedClockIn.split(":").map(Number);
    const [inH, inM] = attendance.clockIn.split(":").map(Number);
    const expected = new Date(attendance.date);
    expected.setHours(expH, expM, 0, 0);
    const actual = new Date(attendance.date);
    actual.setHours(inH, inM, 0, 0);

    let status = "Present";
    if (actual > expected) status = "Late";

    if (hoursWorked < halfDayHours) status = "Half Day";
    else if (hoursWorked >= halfDayHours && hoursWorked < fullDayHours) status = "Late";
    else status = "Present";

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
      companyId,
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

// ------------------- CRON JOB: Auto Mark Absent -------------------
cron.schedule("0 18 * * *", async () => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.toISOString().split("T")[0] + "T00:00:00.000Z");
    const endOfDay = new Date(today.toISOString().split("T")[0] + "T23:59:59.999Z");

    const companies = await Company.find({});

    for (const company of companies) {
      const employees = await Employee.find({ createdBy: company._id });
      const rules = company.attendanceRules || {};
      const expectedClockIn = rules.clockInTime || "09:00";
      const fullDayHours = rules.fullDayHours || 8;
      const halfDayHours = rules.halfDayHours || 4;

      for (const emp of employees) {
        let attendance = await Attendance.findOne({
          userId: emp._id,
          date: { $gte: startOfDay, $lte: endOfDay },
          createdBy: company._id,
        });

        if (!attendance) {
          // No attendance → Absent
          attendance = new Attendance({
            userId: emp._id,
            date: today,
            clockIn: null,
            clockOut: null,
            hoursWorked: 0,
            status: "Absent",
            createdBy: company._id,
          });
        } else if (attendance.clockIn && !attendance.clockOut) {
          // Clocked in but not out → calculate hours till now (6 PM)
          const [inH, inM] = attendance.clockIn.split(":").map(Number);
          const clockOutTime = "18:00";
          const [outH, outM] = clockOutTime.split(":").map(Number);
          const hoursWorked = ((outH + outM / 60) - (inH + inM / 60)).toFixed(2);

          // Determine status
          let status = "Present";
          if (hoursWorked < halfDayHours) status = "Half Day";
          else if (hoursWorked >= halfDayHours && hoursWorked < fullDayHours) status = "Late";

          // Check late based on clockIn
          const [expH, expM] = expectedClockIn.split(":").map(Number);
          const expected = new Date(attendance.date);
          expected.setHours(expH, expM, 0, 0);
          const actual = new Date(attendance.date);
          actual.setHours(inH, inM, 0, 0);
          if (actual > expected) status = "Late";

          attendance.clockOut = clockOutTime;
          attendance.hoursWorked = hoursWorked;
          attendance.status = status;
        }

        await attendance.save();
      }
    }

    console.log("✅ Daily attendance auto-update completed.");
  } catch (err) {
    console.error(err);
  }
});

module.exports = {
  getAttendance,
  getAttendanceByDay,
  updateAttendanceByDay,
  clockIn,
  clockOut,
};

