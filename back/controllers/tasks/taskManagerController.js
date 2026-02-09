const { Admin } = require("../../models/authModel.js");
const { Employee } = require("../../models/employeeModel.js");
const Company = require("../../models/companyModel.js");

/**
 * Add Manager
 * Only one manager per department
 */
const addManager = async (req, res) => {
  const { userId, companyId, obj } = req.body;

  try {
    if (!userId || !companyId || !obj || !obj.employeeId || !obj.department) {
      return res.status(400).json({ message: "Required data missing." });
    }

    const company = await Company.findOne({ _id: companyId });
    if (!company) return res.status(404).json({ message: "Company not found." });

    const user = await Admin.findOne({ _id: userId, companyId });
    if (!user) return res.status(403).json({ message: "You are not allowed." });

    const employee = await Employee.findOne({ _id: obj.employeeId, createdBy: companyId });
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    // Check if department already has a manager
    const existingManager = await Employee.findOne({
      createdBy: companyId,
      department: obj.department,
      taskRole: "manager",
    });
    if (existingManager) {
      return res.status(400).json({ message: `Department "${obj.department}" already has a manager.` });
    }

    // Assign manager role
    employee.taskRole = "manager";
    employee.taskRoleStatus = obj.status ? "active" : "inactive";
    employee.taskRoleDescription = obj.description || "";
    employee.department = obj.department;

    await employee.save();

    return res.status(201).json({ message: `Manager added successfully from ${employee.department} Department.` });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};

/**
 * Get Managers
 * Optional: grouped by department
 */const getManagers = async (req, res) => {
  const { userId, companyId } = req.query;

  try {
    if (!userId || !companyId) {
      return res.status(400).json({ message: "UserId or CompanyId missing." });
    }

    // Check if admin is valid
   let user = await Admin.findOne({ _id: userId, companyId });

if (!user) {
  // Check if manager employee
  user = await Employee.findOne({ _id: userId, createdBy: companyId });
  if (!user || user.taskRole !== "manager") {
    return res.status(403).json({ message: "Only admin or manager is allowed" });
  }
}

     

    // Get managers with only required fields
    const managers = await Employee.find(
      { createdBy: companyId, taskRole: "manager" },
      {
        fullName: 1,
        email: 1,
        taskRoleStatus: 1,
        department: 1,
        profileImage: 1,
      }
    );

    return res.status(200).json(managers);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};


/**
 * Update Manager
 * Update description/status or transfer manager within department
 */const updateManager = async (req, res) => {
  const { userId, companyId, obj } = req.body;

  try {
    if (!userId || !companyId || !obj.employeeId || !obj.department) {
      return res.status(400).json({ message: "Required data missing." });
    }

    // 1️⃣ Check admin permissions
    const user = await Admin.findOne({ _id: userId, companyId });
    if (!user) return res.status(403).json({ message: "You are not allowed." });

    // 2️⃣ Get the employee to update
    const employee = await Employee.findOne({ _id: obj.employeeId, createdBy: companyId });
    if (!employee) return res.status(404).json({ message: "Employee not found." });

    // 3️⃣ Find current manager of the department (if any)
    const currentDeptManager = await Employee.findOne({
      createdBy: companyId,
      department: obj.department,
      taskRole: "manager",
    });

    // 4️⃣ If same employee is already manager → update only
    if (currentDeptManager && currentDeptManager._id.toString() === obj.employeeId) {
      if (obj.description !== undefined) currentDeptManager.taskRoleDescription = obj.description;
      if (obj.status !== undefined) currentDeptManager.taskRoleStatus = obj.status ? "active" : "inactive";
      await currentDeptManager.save();
      return res.status(200).json({ message: `Manager updated successfully from ${currentDeptManager.department} Department.` });
    }

    // 5️⃣ If another employee exists as manager → reset old manager
    if (currentDeptManager) {
      currentDeptManager.taskRole = "none";
      currentDeptManager.taskRoleStatus = "none";
      currentDeptManager.taskRoleDescription = "none";
      await currentDeptManager.save();
    }

    // 6️⃣ Assign manager role to the new employee
    employee.taskRole = "manager";
    employee.taskRoleStatus = obj.status ? "active" : "inactive";
    employee.taskRoleDescription = obj.description || "";

    await employee.save();
    return res.status(200).json({ message: `Manager assigned/updated successfully from ${employee.department} Department.` });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};


/**
 * Delete Manager
 * Only removes manager role for a specific employee
 */
const deleteManager = async (req, res) => {
  const { userId, companyId, employeeId } = req.query;

  try {
    if (!userId || !companyId || !employeeId) return res.status(400).json({ message: "Required data missing." });

    const user = await Admin.findOne({ _id: userId, companyId });
    if (!user) return res.status(403).json({ message: "You are not allowed." });

    const employee = await Employee.findOne({ _id: employeeId, createdBy: companyId, taskRole: "manager" });
    if (!employee) return res.status(404).json({ message: "Manager not found." });

    employee.taskRole = "none";
    employee.taskRoleStatus = "none";
    employee.taskRoleDescription = "none";

    await employee.save();

    return res.status(200).json({ message: `Manager deleted successfully from ${employee.department} Department.` });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: `Server Error: ${err.message}` });
  }
};


module.exports = { addManager, getManagers, updateManager, deleteManager };
