const Task = require("../../models/taskModel");
const SubTask = require("../../models/SubtaskModel");
const Company = require("../../models/companyModel");
const { Admin } = require("../../models/authModel");
const { Employee } = require("../../models/employeeModel");
const Project = require("../../models/projectModel");
const recentActivity = require("../../models/recentActivityModel");
const {sendNotification } = require("../../socketHelpers");


/**
 * 🔹 Validate Company & Parent Task
 */
const validateCompanyAndTask = async (companyId, taskId) => {
  const company = await Company.findById(companyId);
  if (!company) throw new Error("Company not found");

  const task = await Task.findOne({ _id: taskId, companyId });
  if (!task) throw new Error("Parent task not found");

  return task;
};

/**
 * 🔹 Validate Admin / Manager
 */
const validateUser = async (userId) => {
  let user = await Admin.findById(userId);
  if (user) return { role: "admin" };

  user = await Employee.findById(userId);
  if (!user || user.taskRole !== "manager") {
    throw new Error("Only admin or manager is allowed");
  }

  return { role: "manager" };
};

/**
 * 🔹 Validate Assigned Employee
 */
const validateEmployee = async (employeeId) => {
  const emp = await Employee.findById(employeeId);
  if (!emp) throw new Error("Assigned employee not found");
  return emp;
};




/**
 * ✅ CREATE SUBTASK
 */
const createSubTask = async (req, res) => {
  try {
    const {
      companyId,
      taskId,
      createdBy,
      createdByRole,
      employeeId,
      name,
      description,
      remarks,
      startDate,
      endDate,
      priority,
      forceCreate, // ✅ new flag from frontend
    } = req.body;

    await validateCompanyAndTask(companyId, taskId);
    await validateUser(createdBy);
    await validateEmployee(employeeId);

    const task = await Task.findOne({ _id: taskId, companyId });
    if (!task) throw new Error("Task not found");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    if (new Date(endDate) < new Date(startDate)) {
      throw new Error("End date cannot be before start date");
    }

    let taskStatus = "pending";
    if (start.getTime() === today.getTime()) taskStatus = "active";
    else if (start > today) taskStatus = "pending";

    // ====== Check if employee already has active/pending subtask ======
    const activeSubtasks = await SubTask.find({
      employeeId,
      status: { $in: ["active", "pending"] },
    });

    if (activeSubtasks.length > 0 && !forceCreate) {
      return res.status(200).json({
        success: true,
        warning: true,
        message: "Employee already has active/pending subtasks. Do you want to continue?",
        activeSubtasks,
      });
    }

    // ✅ Create SubTask
    const subtask = await SubTask.create({
      companyId,
      taskId,
      createdBy,
      createdByRole,
      employeeId,
      name,
      description,
      remarks,
      startDate,
      endDate,
      priority,
      status: taskStatus,
    });

    // ✅ Link subtask to Task
    await Task.findByIdAndUpdate(
      taskId,
      { $addToSet: { subTasks: subtask._id } },
      { new: true }
    );

    // ✅ Link subtask to Project
    await Project.findByIdAndUpdate(
      task.projectId,
      { $addToSet: { subTasks: subtask._id } },
      { new: true }
    );

     await sendNotification(subtask.employeeId, `New Sub task assigned: ${subtask.name}`, "task", subtask._id);
  

    res.status(201).json({
      success: true,
      message: "Subtask created and linked successfully",
      data: subtask,
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


/**
 * ✅ GET ALL SUBTASKS BY COMPANY
 */
const getSubTasksByCompany = async (req, res) => {
  try {
    const { companyId, userId } = req.query; 

    const company = await Company.findOne({_id:companyId});
    if(!company) return res.status(404).json({message:"Company Not Found."});

    let user = null;
     user = await Admin.findOne({_id:userId, companyId});
     if(!user){
      user = await Employee.findOne({_id:userId, createdBy:companyId});
      if(!user){
        return res.status(404).json({message:"Only admin or manager is allowed"});
      }
     }
    let subtasks = [];
     if(user?.role ==="admin"){
       subtasks = await SubTask.find({ companyId }).sort({ createdAt: -1 })
      .populate("taskId", "name")
      .populate("employeeId", "fullName department")
      .populate("createdBy", "fullName");
     }
     else if(user?.taskRole ==="manager"){
    subtasks = await SubTask.find({createdBy:user?._id, companyId }) .sort({ createdAt: -1 })
      .populate("taskId", "name")
      .populate("employeeId", "fullName department")
      .populate("createdBy", "fullName");
     }

    //  if(!subtasks?.length) return res.status(404).json({message:"Sub Task Not Found."})

  
    res.json({ success: true, data: subtasks });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};




/**
 * ✅ GET SUBTASK BY ID
 */
const getSubTaskById = async (req, res) => {
    const {subTaskId, companyId, userId} = req.query;
          
        let user = null;
     user = await Admin.findOne({_id:userId, companyId});
     if(!user){
      user = await Employee.findOne({_id:userId, createdBy:companyId});
      if(!user){
        return res.status(404).json({message:"Only admin or manager is allowed"});
      }
     }

     const company = await Company.findById(companyId);
     if(!company) return res.status(404).json({message:"Company Not Found."});

      if(!subTaskId) return res.status(404).json({message:"Id Not Found"});
  try {
    const subtask = await SubTask.findById(subTaskId)
      .populate("taskId", "companyId projectId managerId name description")
      .populate("employeeId", "fullName role department designation profileImage taskRole")
      .populate("createdBy", "username email profileImage role companyId");

    if (!subtask) throw new Error("Subtask not found");
    // 1️⃣ Get manager details from employee collection
    let managerInfo = null;
    if (subtask.taskId?.managerId) {
      const manager = await Employee.findOne({
        _id: subtask.taskId.managerId,
        taskRole: "manager", // only if role is manager
      }).select("fullName department profileImage");
      if (manager) {
        managerInfo = manager;
      }
    }

    // 2️⃣ Return subtask with manager info
    res.json({
      success: true,
      data: {
        ...subtask.toObject(),
        managerInfo, // added manager info
      },
    });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
};





/**
 * ✅ UPDATE SUBTASK
 */const updateSubTask = async (req, res) => {
  try {
    const {
      _id,
      companyId,
      taskId,
      employeeId,
      name,
      description,
      remarks,
      startDate,
      endDate,
      priority,
    } = req.body;

    if (!_id) throw new Error("Subtask id is required");

    // 🔒 Required field check
    const requiredFields = {
      employeeId,
      name,
      description,
      startDate,
      endDate,
      priority,
    };

    for (const [key, value] of Object.entries(requiredFields)) {
      if (
        value === undefined ||
        value === null ||
        (typeof value === "string" && value.trim() === "")
      ) {
        throw new Error(`${key} cannot be empty`);
      }
    }

    if (companyId && taskId) {
      await validateCompanyAndTask(companyId, taskId);
    }

    if (employeeId) {
      await validateEmployee(employeeId);
    }

    if (new Date(endDate) < new Date(startDate)) {
      throw new Error("End date cannot be before start date");
    }

    const updateData = {
      employeeId,
      name,
      description,
      remarks,
      startDate,
      endDate,
      priority,
    };

    // 🧠 Status logic
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    updateData.status =
      start.getTime() === today.getTime()
        ? "active"
        : start > today
          ? "pending"
          : updateData.status;

    const subtask = await SubTask.findByIdAndUpdate(
      _id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!subtask) throw new Error("Subtask not found");

    res.json({
      success: true,
      message: "Subtask updated successfully",
      data: subtask,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};



/**
 * ✅ CHANGE SUBTASK STATUS
 */
const subTaskStatusChange = async (req, res) => {
  try {
    const { companyId, subTaskId, userId, status } = req.body;
    const company = await Company.findOne({ _id: companyId })
    if (!company) return res.status(404).json({ message: "Company Not Found." });

    let user = await Admin.findOne({_id:userId, companyId});
    if(!user){
      user = await Employee.findOne({_id:userId, createdBy:companyId});
      if(!user) return res.status(404).json({message:"User Not Found.", success:false})
    }
  

    const subtask = await SubTask.findOne({ _id: subTaskId, companyId });
    if (!subtask) throw new Error("Subtask not found");

    subtask.status = status;
    await subtask.save();

      if(subtask?.status==="completed"){
         await recentActivity.create({title:"Task Completed.", createdBy:user?._id, createdByRole:user?.role==="admin"?"Admin":"Employee", companyId:companyId})
          }

    res.json({
      success: true,
      message: "Subtask status updated successfully",
      data: { subTaskId, status },
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};




/**
 * ✅ REASSIGN SUBTASK
 */
const reassignSubTask = async (req, res) => {
  try {
    const {
      companyId,
      taskId, //y sub task ki id hai 
      adminId,
      employeeId,
      startDate,
      endDate,
    } = req.body;
    await validateUser(adminId);
   
    const subtask = await SubTask.findOne({ _id: taskId, companyId });
    if (!subtask) throw new Error("Subtask not found");

    if (employeeId) {
      await validateEmployee(employeeId);
      subtask.employeeId = employeeId;
    }

    if (startDate) subtask.startDate = startDate;
    if (endDate) subtask.endDate = endDate;

    if (subtask.startDate && subtask.endDate &&
      new Date(subtask.endDate) < new Date(subtask.startDate)) {
      throw new Error("End date cannot be before start date");
    }

    await subtask.save();

    res.json({
      success: true,
      message: "Subtask reassigned successfully",
      data: subtask,
    });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};




/**
 * ✅ DELETE SUBTASK
 */
/**
 * ✅ PERMANENT DELETE SUBTASK
 */
const deleteSubTask = async (req, res) => {
  try {
    const { subtaskId, companyId, adminId } = req.query;

    const company = await Company.findOne({_id:companyId});
    if(!company) return res.status(404).json({message:"Company Not Found."})

    await validateUser(adminId);

    // 1️⃣ Find subtask (taskId nikalne ke liye)
    const subtask = await SubTask.findById(subtaskId);
    if (!subtask) throw new Error("Subtask not found");

    // 2️⃣ Find parent task (projectId nikalne ke liye)
    const task = await Task.findById(subtask.taskId);
    if (!task) throw new Error("Parent task not found");

    // 3️⃣ Delete subtask (PERMANENT)
    await SubTask.findByIdAndDelete(subtaskId);

    // 4️⃣ Remove subtaskId from Task.subTasks
    await Task.findByIdAndUpdate(
      subtask.taskId,
      { $pull: { subTasks: subtaskId } }
    );

    // 5️⃣ Remove subtaskId from Project.subTasks
    await Project.findByIdAndUpdate(
      task.projectId,
      { $pull: { subTasks: subtaskId } }
    );

    res.json({
      success: true,
      message: "Subtask permanently deleted and references cleaned",
    });
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message,
    });
  }
};


const getIdByTaskDetail = async (req, res) => {
  try {
    const { taskId, department, companyId, adminId } = req.query;

    const company = await Company.findOne({ _id: companyId });
    if (!company) return res.status.json({ message: "Company Not Found." });

    let task = await Task.findOne({ _id: taskId, companyId });

    if (!task) {
      task = await SubTask.findOne({ _id: taskId, companyId });
    }

    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    await validateUser(adminId);

    const employees = await Employee.find({ department: department })

    if (employees) {
      return res.status(200).json({ message: "employee successfully.", data: employees })
    }
  }
  catch (err) {
    console.log(err);
    res.status(400).json({ success: false, message: err.message });
  }
}




module.exports = {
  createSubTask,
  getSubTasksByCompany,
  getSubTaskById,
  updateSubTask,
  subTaskStatusChange,
  reassignSubTask,
  deleteSubTask,
  getIdByTaskDetail
};
