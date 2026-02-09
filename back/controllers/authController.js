const { Admin } = require("../models/authModel.js");
const bcrypt = require("bcrypt");
const { generateToken } = require("../utils/token.js");
const { Employee } = require("../models/employeeModel.js"); // adjust path if needed
const Company = require("../models/companyModel");
const { Expense } = require("../models/expenseModel.js");
const { LeaveRequest } = require("../models/leaveRequestModel");
const { Leave } = require("../models/leaveModel");
const Attendance = require("../models/attendanceModel");
const Task = require("../models/taskModel");
const SubTask = require("../models/SubtaskModel");
const RecentActivity = require("../models/recentActivityModel.js");
const Project = require("../models/projectModel");
const mongoose = require("mongoose")
const PayRoll = require("../models/payRollModel");
const Department = require("../models/departmentModel.js");
const Notification = require("../models/NotificationModel"); // Notification model


// ---------------- Register Admin ----------------

const registerAdmin = async (req, res) => {
  try {
    const { username, email, password, companyId, role, userId, mobile, address } = req.body;

    // Superadmin check
    const superAdmin = await Admin.findById(userId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized. Only superadmins can create admins." });
    }

    // Email checks
    if (await Admin.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists" });
    }

    if (await Employee.findOne({ email })) {
      return res.status(400).json({ message: "Email already exists by Employee" });
    }

    // Company check
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    if (company.admin) {
      return res.status(400).json({ message: "This company already has an admin" });
    }

    // Create admin
    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = await Admin.create({
      username,
      email,
      password: hashedPassword,
      companyId,
      role: role || "admin",
      mobile,
      address
    });

    // 🔥 VERY IMPORTANT: update company with admin id
    company.admins = newAdmin._id;
    await company.save();

    return res.status(201).json({
      message: "Admin registered successfully",
      user: {
        id: newAdmin._id,
        username: newAdmin.username,
        email: newAdmin.email,
        role: newAdmin.role,
        companyId: newAdmin.companyId
      }
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Update Admin ----------------
const updateAdmin = async (req, res) => {
  try {
    const adminId = req.params.id; // admin to update
    const superAdminId = req.userId;

    // Superadmin check
    const superAdmin = await Admin.findById(superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized. Only superadmins can update admins." });
    }

    const adminToUpdate = await Admin.findById(adminId);
    if (!adminToUpdate) return res.status(404).json({ message: "Admin not found" });

    const { username, email, password, companyId, role, mobile, address } = req.body;

    // Check if new companyId is already assigned to another admin
    if (companyId && companyId !== adminToUpdate.companyId.toString()) {
      const companyAssigned = await Admin.findOne({ companyId });
      if (companyAssigned) {
        return res.status(400).json({ message: "This company already has an admin assigned." });
      }
    }

    // Update fields
    if (username) adminToUpdate.username = username;
    if (email) adminToUpdate.email = email;
    if (password) adminToUpdate.password = await bcrypt.hash(password, 10);
    if (companyId) adminToUpdate.companyId = companyId;
    if (role) adminToUpdate.role = role;
    if (mobile) adminToUpdate.mobile = mobile;
    if (address) adminToUpdate.address = address;

    await adminToUpdate.save();

    return res.status(200).json({
      message: "Admin updated successfully",
      user: {
        id: adminToUpdate._id,
        username: adminToUpdate.username,
        email: adminToUpdate.email,
        role: adminToUpdate.role,
        companyId: adminToUpdate.companyId,
        mobile: adminToUpdate.mobile,
        address: adminToUpdate.address
      },
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Delete Admin ----------------
const deleteAdmin = async (req, res) => {
  try {
    const adminId = req.params.id; // admin to delete
    const superAdminId = req.userId;

    // Superadmin check
    const superAdmin = await Admin.findById(superAdminId);
    if (!superAdmin || superAdmin.role !== "super_admin") {
      return res.status(403).json({ message: "Unauthorized. Only superadmins can delete admins." });
    }

    const adminToDelete = await Admin.findById(adminId);
    if (!adminToDelete) return res.status(404).json({ message: "Admin not found" });

    await Admin.findByIdAndDelete(adminId);

    return res.status(200).json({ message: "Admin deleted successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Login Admin ----------------
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    let user = null;
    let role = null;

    /**
     * 1️⃣ Try Admin login
     */
    user = await Admin.findOne({ email })
      .populate("companyId", "name")
      .select("+password");

    if (user) {
      role = user?.role || "admin";
    } else {
      /**
       * 2️⃣ Try Employee login
       */
      user = await Employee.findOne({ email })
        .populate("createdBy", "name")
        .select("+password");
      if (user) role = user?.role || "employee";
    }

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    /**
     * 3️⃣ Password check
     */
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    /**
     * 4️⃣ Token generate
     */
    const token = generateToken({
      id: user._id,
      role,
      companyId: user.companyId?._id,
    });

    /**
     * 5️⃣ Response formatting
     */
    const userData = user.toObject();
    delete userData.password;

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        ...userData,
        role,
        fullName: userData.fullName || userData.name, // ✅ unified key
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

const getUserById = async (req, res) => {
  try {
    const { companyId, userId } = req.query; // ya req.query / req.params (jo frontend se bhejo)

    // 1️⃣ Check company exists
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found" });
    }

    let user = null;
    let role = "";

    // 2️⃣ Check Admin with userId + companyId
    user = await Admin.findOne({
      _id: userId,
      companyId: companyId, // ya createdBy.companyId
    })
      .select("-password")
      .populate("companyId", "name _id");

    if (user) {
      role = user?.role || "admin";
    }

    // 3️⃣ If not Admin, check Employee
    if (!user) {
      user = await Employee.findOne({
        _id: userId,
        createdBy: companyId, // ya createdBy.companyId
      })
        .select("-password")
        .populate("createdBy", "name _id");

      if (user) {
        role = user?.role || "employee";
      }
    }

    // 4️⃣ If still not found
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found for this company" });
    }

    res.status(200).json({ user, role });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


// ---------------- Get All Admins ----------------
const getAllAdmins = async (req, res) => {
  try {
    const adminId = req.params.id;
    // 1️⃣ Check requesting admin
    const requestingAdmin = await Admin.findById(adminId)
      
    if (!requestingAdmin) {
      return res.status(404).json({
        message: "Admin not found"
      });
    }

    // 2️⃣ Role check
    if (requestingAdmin.role !== "super_admin") {
      return res.status(403).json({
        message: "Access denied. Only super admin can view all admins"
      });
    }

    // 3️⃣ Fetch all admins
    const admins = await Admin.find().select("-password").populate({
    path: "companyId",
    select: "name _id", // _id include optional, lekin mostly populate me reh jaata hai
  })
  .lean();;
    res.status(200).json({
      message: "Admins fetched successfully",
      admins
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error"
    });
  }
};

const updateUser = async (req, res) => {
  try {
    const { userId, companyId, data } = req.body; // frontend sends data according to role
    if (!userId || !companyId || !data) {
      return res.status(400).json({ message: "userId, companyId and data are required" });
    }

    // 1️⃣ Validate company
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Invalid companyId" });

    let user = await Admin.findOne({ _id: userId, companyId });
    let modelName = "Admin";

    if (!user) {
      user = await Employee.findOne({ _id: userId, createdBy: companyId });
      if (!user) return res.status(404).json({ message: "User not found in this company" });
      modelName = "Employee";
    }

    // 2️⃣ Map frontend fields to backend model fields
    if (modelName === "Admin") {
      if (data?.username !== undefined) user.username = data.username;
      if (data?.mobile !== undefined) user.mobile = data.mobile;
      if (data?.profileImage !== undefined) user.profileImage = data.profileImage;
    } else {
      if (data?.fullName !== undefined) user.fullName = data.fullName;
      if (data?.contact !== undefined) user.contact = data.contact;
      if (data?.profileImage !== undefined) user.profileImage = data.profileImage;
    }

    // 3️⃣ Save updated user
    const updatedUser = await user.save();

    res.status(200).json({
      message: `${modelName} updated successfully`,
      user: updatedUser,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};


const changePassword = async (req, res) => {
  try {
    const { userId, email, newPassword, companyId } = req.body;

    if (!userId || !email || !newPassword || !companyId) {
      return res.status(400).json({
        message: "userId, email, newPassword and companyId are required",
      });
    }

    // 1️⃣ Validate company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Invalid companyId" });
    }

    let user = null;
    let role = "";

    // 2️⃣ Check Admin
    user = await Admin.findOne({ _id : userId, email, companyId });
    if (user) {
      role = user?.role || "Admin";
    } else {
      // 3️⃣ Check Employee
      user = await Employee.findOne({
        _id : userId,
        email,
        createdBy: companyId,
      });
      if (!user) {
        return res.status(404).json({
          message: "User not found in this company",
        });
      }
      role = user?.role || "Employee";
    }

    // 4️⃣ Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.status(200).json({
      message: `${role} password updated successfully`,
    });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ message: `Server error:= ${err?.message}` });
  }
};

const getDashboardSummary = async (req, res) => {
  try {
    const { userId, companyId } = req.query;

    if (!userId) return res.status(400).json({ message: "userId is required" });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = now;

    let summary = {};

    // Fetch user and role
    const user =
     (await Admin.findOne({ _id: userId, role:"super_admin" })) ||
      (await Admin.findOne({ _id: userId, companyId })) ||
      (await Employee.findOne({ _id: userId, createdBy: companyId }));

    if (!user) return res.status(404).json({ message: "User Not Found" });

    if (user.role === "admin") {
      // ================= Admin Summary =================
      const totalEmployees = await Employee.countDocuments({ createdBy: companyId });
      const newEmployeesThisMonth = await Employee.countDocuments({
        createdBy: companyId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });
      const pendingTask = await Task.countDocuments({ companyId, status: "pending" });
      const urgentTask = await Task.countDocuments({ companyId, status: "pending", urgent: true });

      const attendanceThisMonthCount = await Attendance.countDocuments({
        companyId,
        date: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const totalPossibleAttendance = totalEmployees * now.getDate();
      const attendancePercentage = totalPossibleAttendance
        ? Math.round((attendanceThisMonthCount / totalPossibleAttendance) * 100)
        : 0;

      const todayStart = new Date(now.setHours(0, 0, 0, 0));
      const todayEnd = new Date(now.setHours(23, 59, 59, 999));
      const todayPresentCount = await Attendance.countDocuments({
        companyId,
        date: { $gte: todayStart, $lte: todayEnd }
      });

      const pendingLeave = await LeaveRequest.countDocuments({ companyId, status: "pending" });
      const newLeavesThisMonth = await LeaveRequest.countDocuments({
        companyId,
        appliedDate: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const expenseThisMonth = await Expense.countDocuments({
        companyId,
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const employeeGrowth = totalEmployees
        ? Math.round((newEmployeesThisMonth / totalEmployees) * 100)
        : 0;

      const recentTasks = await Task.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(4);

      const recentActivity = await RecentActivity.find({companyId:companyId, createdBy:userId}).populate("createdBy","username")

      summary = {
        totalEmployees,
        newEmployeesThisMonth,
        pendingTask,
        urgentTask,
        attendanceThisMonthCount,
        attendancePercentage,
        todayPresentCount,
        pendingLeave,
        newLeavesThisMonth,
        expenseThisMonth,
        employeeGrowth,
        recentTasks,
        recentActivity
      };
    } 
    else if (user.role === "employee") {
      // ================= Employee Summary =================
   

      const pendingLeave = await LeaveRequest.countDocuments({
        userId: user._id,
        status: "pending"
      });

      // Growth for employee can be total tasks completed this month or leaves applied? 
      const leavesThisMonth = await LeaveRequest.countDocuments({
        userId: user._id,
        appliedDate: { $gte: startOfMonth, $lte: endOfMonth }
      });
       let recentTasks = null;
       let pendingTask = null;
       let urgentTask = null;
       let recentActivity = null;
       if(user?.taskRole === "manager"){
     recentActivity = await RecentActivity.find({companyId:companyId, createdBy:userId}).populate("createdBy","fullName")
     pendingTask = await Task.countDocuments({managerId:user?._id, companyId, status: "pending" });
      urgentTask = await Task.countDocuments({managerId:user?._id, companyId, status: "pending", urgent: true });
     recentTasks = await Task.find({ managerId:user?._id, companyId }).sort({ createdAt: -1 }).limit(4);
       }
       else if(user?.taskRole === "none"){
             recentActivity = await RecentActivity.find({companyId:companyId, createdBy:userId}).populate("createdBy","fullName")
         pendingTask = await SubTask.countDocuments({employeeId:user?._id, companyId, status: "pending" });
       urgentTask = await SubTask.countDocuments({employeeId:user?._id, companyId, status: "pending", urgent: true });
     recentTasks = await SubTask.find({ employeeId:user?._id, companyId }).sort({ createdAt: -1 }).limit(4);
       }
     
      summary = {
        pendingTask,
        urgentTask,
        pendingLeave,
        leavesThisMonth,
        recentTasks,
        recentActivity
      };
    } else if (user.role === "super_admin") {
      // ================= Super Admin Summary =================
      const totalCompanies = await Company.countDocuments();
      const newCompaniesThisMonth = await Company.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const totalAdmins = await Admin.countDocuments();
      const newAdminsThisMonth = await Admin.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const totalEmployees = await Employee.countDocuments();
      const newEmployeesThisMonth = await Employee.countDocuments({
        createdAt: { $gte: startOfMonth, $lte: endOfMonth }
      });

      const companyGrowth = totalCompanies
        ? Math.round((newCompaniesThisMonth / totalCompanies) * 100)
        : 0;

      const adminGrowth = totalAdmins
        ? Math.round((newAdminsThisMonth / totalAdmins) * 100)
        : 0;

      const employeeGrowth = totalEmployees
        ? Math.round((newEmployeesThisMonth / totalEmployees) * 100)
        : 0;
     const recentTasks = await Project.find()
  .sort({ createdAt: -1 }) // descending, latest first
  .limit(4);               // sirf 4 documents


           const  recentActivity = await RecentActivity.find({createdBy:userId})
      summary = {
        totalCompanies,
        newCompaniesThisMonth,
        totalAdmins,
        newAdminsThisMonth,
        totalEmployees,
        newEmployeesThisMonth,
        companyGrowth,
        adminGrowth,
        employeeGrowth,
        recentActivity,
        recentTasks
      };
    }

    return res.status(200).json({
      success: true,
      role: user.role,
      summary
    });
  } catch (err) {
    console.error("Dashboard Error:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};


const analyticsReport = async (req, res) => {
  try {
    const { userId, companyId } = req.query;
    if (!userId || !companyId)
      return res.status(400).json({ message: "userId or companyId is required" });

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company Not Found." });

    const user = await Admin.findOne({ _id: userId, companyId });
    if (!user) return res.status(404).json({ message: "Admin Not Found." });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = now;

    // ====== Employees ======
    const totalEmployees = await Employee.countDocuments({ createdBy: companyId });

    // ====== Attendance this month ======
    const attendanceThisMonthCount = await Attendance.countDocuments({
      companyId,
      date: { $gte: startOfMonth, $lte: endOfMonth },
    });

    const totalPossibleAttendance = totalEmployees * now.getDate();
    const attendancePercentage = totalPossibleAttendance
      ? Math.round((attendanceThisMonthCount / totalPossibleAttendance) * 100)
      : 0;

    // ====== Expense this month ======
    const expenseThisMonthData = await Expense.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId), createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalExpense: { $sum: "$amount" } } },
    ]);
    const expenseThisMonth = expenseThisMonthData[0]?.totalExpense || 0;

    // ====== Payroll this month ======
    const payrollThisMonthData = await PayRoll.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId), createdAt: { $gte: startOfMonth, $lte: endOfMonth } } },
      { $group: { _id: null, totalPayroll: { $sum: "$amount" } } },
    ]);
    const payrollThisMonth = payrollThisMonthData[0]?.totalPayroll || 0;

    // ====== Attendance last 7 days ======
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6); // last 7 days including today

    const last7DaysAttendance = await Attendance.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId), date: { $gte: sevenDaysAgo, $lte: now } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          present: { $sum: 1 },
        },
      },
    ]);

    const attendanceLast7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
      const dateStr = d.toISOString().split("T")[0];
      const record = last7DaysAttendance.find(a => a._id === dateStr);
      const present = record ? record.present : 0;
      attendanceLast7Days.unshift({
        date: dateStr,
        day: dayName,
        present,
        absent: totalEmployees - present,
      });
    }

    const startOfLast6Months = new Date(
  now.getFullYear(),
  now.getMonth() - 6,
  1
);


    // ====== Expense grouped by day ======
   const expenseGrouped = await Expense.aggregate([
  {
    $match: {
      createdBy: new mongoose.Types.ObjectId(companyId),
      createdAt: { $gte: startOfLast6Months, $lte: endOfMonth },
    },
  },
  {
    $group: {
      _id: {
        year: { $year: "$createdAt" },
        month: { $month: "$createdAt" },
      },
      totalExpense: { $sum: "$amount" },
    },
  },
  { $sort: { "_id.year": 1, "_id.month": 1 } },
]);


    // ====== Task summary ======
    const taskStatusCounts = await Task.aggregate([
      { $match: { companyId: new mongoose.Types.ObjectId(companyId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const taskSummary = {
      pending: taskStatusCounts.find(t => t._id === "pending")?.count || 0,
      active: taskStatusCounts.find(t => t._id === "active")?.count || 0,
      completed: taskStatusCounts.find(t => t._id === "completed")?.count || 0,
    };

    // ====== Department-wise analytics ======
    const departments = await Department.find({ companyId });

    const departmentAnalytics = await Promise.all(
      departments.map(async (dept) => {
        const deptEmployees = await Employee.find({ department: dept.name, createdBy: companyId }).select("_id");

        const deptEmployeeIds = deptEmployees.map(e => e._id);
        // Department attendance this month
        const deptAttendanceCount = await Attendance.countDocuments({
          userId: { $in: deptEmployeeIds },
          date: { $gte: startOfMonth, $lte: endOfMonth },
        });
        const deptTotalPossibleAttendance = deptEmployeeIds.length * now.getDate();
        const deptAttendancePercentage = deptTotalPossibleAttendance
          ? Math.round((deptAttendanceCount / deptTotalPossibleAttendance) * 100)
          : 0;
        // Department completed tasks this month
        const deptCompletedTasksCount = await Task.countDocuments({
          companyId,
          assignedTo: { $in: deptEmployeeIds },
          status: "completed",
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });

        const deptTotalTasksCount = await Task.countDocuments({
          companyId,
          assignedTo: { $in: deptEmployeeIds },
          createdAt: { $gte: startOfMonth, $lte: endOfMonth },
        });


        const deptCompletedTaskPercentage = deptTotalTasksCount
          ? Math.round((deptCompletedTasksCount / deptTotalTasksCount) * 100)
          : 0;

        return {
          departmentId: dept._id,
          departmentName: dept.name,
          attendancePercentage: deptAttendancePercentage,
          completedTaskPercentage: deptCompletedTaskPercentage,
        };
      })
    );

    const summary = {
      totalEmployees,
      attendancePercentage,
      expenseThisMonth,
      payrollThisMonth,
      attendanceLast7Days,
      expenseGrouped,
      taskSummary,
      departmentAnalytics,
    };

    return res.status(200).json({ success: true, summary });
  } catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};


const getNotificationData = async(req,res) =>{
  try{
      const { userId,companyId } = req.query;

    if (!userId || !companyId) {
      return res.status(400).json({
        message: "userId, companyId are required",
      });
    }

    // 1️⃣ Validate company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Invalid companyId" });
    }

    let user = null;
    let role = "";

    // 2️⃣ Check Admin
    user = await Admin.findOne({ _id : userId, companyId });
    if (user) {
      role = user?.role || "Admin";
    } else {
      // 3️⃣ Check Employee
      user = await Employee.findOne({
        _id : userId,
        createdBy: companyId,
      });
      if (!user) {
        return res.status(404).json({
          message: "User not found in this company",
        });
      }
      role = user?.role || "Employee";
    }
   
    const notification = await Notification.find({companyId, userId});

    res.status(200).json({notification, success:true, message:"successfully."})

  }
  catch (err) {
    console.error("Analytics Error:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
}


// Export
module.exports = {
  registerAdmin,
  updateAdmin,
  deleteAdmin,
  loginAdmin,
  getUserById,
  getAllAdmins,
  updateUser,
  changePassword,
  getDashboardSummary,
  analyticsReport
};
