const Project = require("../../models/projectModel");
const Company = require("../../models/companyModel");
const { Admin } = require("../../models/authModel");
const Task = require("../../models/taskModel");
const SubTask = require("../../models/SubtaskModel");
const { Employee } = require("../../models/employeeModel");
const recentActivity = require("../../models/recentActivityModel");



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
 * ✅ ADD PROJECT
 */
const addProject = async (req, res) => {
  const { adminId, companyId, obj } = req.body;

  try {
    // 1️⃣ Validation
    if (!adminId || !companyId || !obj) {
      return res.status(400).json({ message: "Required data missing." });
    }

    // 2️⃣ Company check
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // 3️⃣ Admin check
    const admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) {
      return res.status(403).json({ message: "You are not authorized." });
    }

    // 4️⃣ Status logic based on startDate
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const startDate = new Date(obj.startDate);
    startDate.setHours(0, 0, 0, 0);

    const projectStatus = startDate <= today ? "active" : "pending";

    // 4️⃣ Create project
    const project = new Project({
      companyId,
      adminId,
      name: obj.name,
      description: obj.description,
      startDate: obj.startDate,
      endDate: obj.endDate,
      priority: obj.priority,
      remarks: obj.remarks,
      status: projectStatus,
    });

    await project.save();

    return res.status(201).json({
      message: "Project created successfully.",
      project,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};

/**
 * ✅ GET PROJECTS (Company wise)
 */
const getProjects = async (req, res) => {
  const { adminId, companyId } = req.query;

  try {
    if (!adminId || !companyId) {
      return res.status(400).json({ message: "Required data missing." });
    }
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Admin check
    let admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) {
      admin = await Employee.findOne({ _id: adminId, createdBy: companyId });
      if (!admin || admin?.taskRole !== "manager") {
        return res.status(403).json({ message: "You do not have permission to perform this action." })
      }
    }

    let projects = [];
    if (admin.role === "admin") {
      projects = await Project.find({ companyId, adminId })
        .sort({ createdAt: -1 });
    }

    else if (admin.taskRole === "manager") {
      projects = await Project.find({ companyId })
        .sort({ createdAt: -1 });
    }

    if (!projects.length) {
      return res.status(404).json({ message: "project not found." })
    }


    return res.status(200).json(projects);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};

const getProjectById = async (req, res) => {
  const { adminId, companyId, projectId } = req.query;
  try {
    // 1️⃣ Validate admin
    await validateUser(adminId);

    // 2️⃣ Check company
    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found." });

    // 3️⃣ Fetch project
    const project = await Project.findOne({ _id: projectId, companyId })
      .populate("adminId", "username email role profileImage") // project creator
      .populate({
        path: "tasks",
        populate: [
          { path: "createdBy", select: "username email role profileImage" },
          { path: "managerId", select: "fullName department role profileImage" },
          {
            path: "subTasks",
            populate: [
              { path: "createdBy", select: "username email role profileImage" },
              { path: "employeeId", select: "fullName role department designation profileImage" }
            ]
          }
        ]
      })
      .populate({
        path: "subTasks", // if project has its own subtasks field
        populate: [
          { path: "createdBy", select: "username email role profileImage" },
          { path: "employeeId", select: "fullName role department designation profileImage" },
          { path: "taskId", select: "name managerId", populate: { path: "managerId", select: "fullName department role profileImage" } }
        ]
      });

    if (!project) throw new Error("Project not found");

    res.json({
      success: true,
      data: project,
    });

  } catch (err) {
    console.error(err);
    res.status(404).json({
      success: false,
      message: err.message,
    });
  }
};


/**
 * ✅ UPDATE PROJECT
 */
const updateProject = async (req, res) => {
  const { adminId, companyId, obj } = req.body;


  try {
    if (!adminId || !companyId || !obj._id || !obj) {
      return res.status(400).json({ message: "Required data missing." });
    }

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }
    // Admin check
    const admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) {
      return res.status(403).json({ message: "You are not authorized." });
    }

    const project = await Project.findOne({ _id: obj._id, companyId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // Update allowed fields
    if (obj.name !== undefined) project.name = obj.name;
    if (obj.description !== undefined) project.description = obj.description;
    if (obj.startDate !== undefined) project.startDate = obj.startDate;
    if (obj.endDate !== undefined) project.endDate = obj.endDate;
    if (obj.priority !== undefined) project.priority = obj.priority;
    if (obj.remarks !== undefined) project.remarks = obj.remarks;
    if (obj.status !== undefined) project.status = obj.status;

    await project.save();

    return res.status(200).json({
      message: "Project updated successfully.",
      project,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};

/**
 * ✅ DELETE PROJECT
 *//**
* ✅ PERMANENT DELETE PROJECT (FULL CASCADE)
*/
const deleteProject = async (req, res) => {
  const { adminId, companyId, projectId } = req.query;

  try {
    if (!adminId || !companyId || !projectId) {
      return res.status(400).json({ message: "Required data missing." });
    }

    // 1️⃣ Company check
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // 2️⃣ Admin authorization check
    const admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) {
      return res.status(403).json({ message: "You are not authorized." });
    }

    // 3️⃣ Find project
    const project = await Project.findOne({ _id: projectId, companyId });
    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

    // 4️⃣ Find all tasks of this project
    const tasks = await Task.find({ projectId, companyId });

    // 5️⃣ Collect all subTask IDs from tasks
    const subTaskIds = tasks.flatMap(task => task.subTasks || []);

    // 6️⃣ Delete all subtasks
    if (subTaskIds.length > 0) {
      await SubTask.deleteMany({ _id: { $in: subTaskIds } });
    }

    // 7️⃣ Delete all tasks of this project
    await Task.deleteMany({ projectId });

    // 8️⃣ Delete project itself
    await Project.findByIdAndDelete(projectId);

    await recentActivity.create({title:`${Project?.name} Project Deleted.`, createdBy:admin?._id, createdByRole:"Admin", companyId:companyId})


    return res.status(200).json({
      success: true,
      message: "Project, tasks and subtasks permanently deleted",
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: `Server Error: ${err.message}`,
    });
  }
};


const projectStatusChange = async (req, res) => {
  try {
    const { adminId, companyId, projectId, status } = req.body;

    if (!adminId || !companyId || !projectId || !status) {
      return res.status(400).json({ message: "Required data missing." });
    }
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Company not found." });
    }

    // Admin check
    const admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) {
      return res.status(403).json({ message: "You are not authorized." });
    }

    const project = await Project.findOneAndUpdate({
      _id: projectId,
      companyId,
    }, { $set: { status } });

    if (!project) {
      return res.status(404).json({ message: "Project not found." });
    }

      if(subTask?.status==="completed"){
     await recentActivity.create({title:"Task Completed.", createdBy:admin?._id, createdByRole:"Admin", companyId:companyId})
      }

    return res.status(200).json({ message: "Project Status Updated Successfully." });
  }
  catch (err) {
    console.log(err);
    res.status(500).json({ message: `Server Error: ${err}` })
  }
};






const getDashboardSummary = async (req, res) => {
  try {
    const { userId, companyId } = req.query;

    if (!userId || !companyId) {
      return res.status(400).json({ success: false, message: "userId and companyId are required" });
    }

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ success: false, message: "Company not found." });

    let user = await Admin.findOne({ _id: userId, companyId });
    let role = "admin";

    if (!user) {
      user = await Employee.findOne({ _id: userId, createdBy: companyId });
      role = "employee";
      if (!user) return res.status(404).json({ success: false, message: "User not found." });
    }

    const today = new Date();

    if (role === "admin") {
      // ===== Admin logic =====
      const totalProjects = await Project.countDocuments({ companyId });
      const totalTasks = await Task.countDocuments({ companyId });
      const pendingTasks = await Task.countDocuments({ companyId, status: "pending" });
      const activeTasks = await Task.countDocuments({ companyId, status: "active" });
      const overdueTasks = await Task.countDocuments({
        companyId,
        endDate: { $lt: today },
        status: { $ne: "completed" },
      });

      const recentProjects = await Project.find({ companyId }).populate("adminId")
        .sort({ createdAt: -1 })
        .limit(4);

      const recentTasks = await Task.find({ companyId })
        .sort({ createdAt: -1 })
        .limit(4)
        .select("_id name status startDate endDate")
        .populate("managerId", "fullName profileImage");

      return res.status(200).json({
        success: true,
        summary: {
          totalProjects,
          totalTasks,
          pendingTasks,
          activeTasks,
          overdueTasks,
          recentProjects,
          recentTasks,
        },
      });
    } else if (user?.taskRole === "manager") {
      // ===== Manager logic =====
      const totalTasks = await Task.countDocuments({
        companyId,
        $or: [{ managerId: user._id }, { createdBy: user._id }],
      });
      const pendingTasks = await Task.countDocuments({
        companyId,
        $or: [{ managerId: user._id }, { createdBy: user._id }],
        status: "pending",
      });
      const activeTasks = await Task.countDocuments({
        companyId,
        $or: [{ managerId: user._id }, { createdBy: user._id }],
        status: "active",
      });
      const overdueTasks = await Task.countDocuments({
        companyId,
        $or: [{ managerId: user._id }, { createdBy: user._id }],
        endDate: { $lt: today },
        status: { $ne: "completed" },
      });

      const recentProjects = await Task.find({
        companyId,
        $or: [{ managerId: user._id }, { createdBy: user._id }],
      })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("managerId", "fullName profileImage")
        .populate("createdBy");

      const recentTasks = await SubTask.find({
        companyId,
        createdBy: user._id,
      })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("taskId")
        .populate("createdBy");

      return res.status(200).json({
        success: true,
        summary: {
          totalTasks,
          pendingTasks,
          activeTasks,
          overdueTasks,
          recentTasks,
          recentProjects,
        },
      });
    } else {
      // ===== Employee logic =====
      const totalTasks = await SubTask.countDocuments({ companyId, employeeId: user._id });
      const pendingTasks = await SubTask.countDocuments({ companyId, employeeId: user._id, status: "pending" });
      const activeTasks = await SubTask.countDocuments({ companyId, employeeId: user._id, status: "active" });
      const overdueTasks = await SubTask.countDocuments({
        companyId,
        employeeId: user._id,
        endDate: { $lt: today },
        status: { $ne: "completed" },
      });
     // y naam recent project is liye use kiya hai taki frontend m koi problem na ho 
      const recentProjects = await SubTask.find({ companyId, employeeId: user._id })
        .sort({ createdAt: -1 })
        .limit(4)
        .populate("taskId")
        .populate("createdBy");

      return res.status(200).json({
        success: true,
        summary: {
          totalTasks,
          pendingTasks,
          activeTasks,
          overdueTasks,
          recentProjects,
        },
      });
    }
  } catch (err) {
    console.error("Dashboard summary error:", err);
    return res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};


module.exports = {
  addProject,
  getProjects,
  updateProject,
  deleteProject,
  projectStatusChange,
  getProjectById,
  getDashboardSummary
};


