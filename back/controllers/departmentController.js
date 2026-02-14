const Department = require("../models/departmentModel.js");
const { Admin } = require("../models/authModel.js");
const { Employee } = require("../models/employeeModel.js"); // adjust path if needed

// ---------------- Add Department ----------------
const addDepartment = async (req, res) => {
  try {
    const { name, description, companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    // Optional: check if any admin exists for this company
    const adminExists = await Admin.findOne({ companyId });
    if (!adminExists) {
      return res.status(404).json({ message: "No admin found for this company" });
    }

    if (!name) {
      return res.status(400).json({ message: "Department name  are required" });
    }

    // Check if department already exists for this company
    const existingDept = await Department.findOne({ name, createdBy: companyId });
    if (existingDept) {
      return res.status(400).json({ message: "Department already exists for this company" });
    }

    const newDept = new Department({ name, description, createdBy: companyId });
    await newDept.save();

    res.status(201).json({
      message: "Department added successfully",
      department: newDept,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Get All Departments for a specific company ----------------
const getDepartments = async (req, res) => {
  try {
    const { companyId } = req.params; // frontend should send ?companyId=xxx
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const departments = await Department.find({ createdBy: companyId }).sort({ name: 1 });
    res.status(200).json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Get Department by ID ----------------
const getDepartmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.query; // optional check
    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const department = await Department.findOne({ _id: id, createdBy: companyId });
    if (!department) {
      return res.status(404).json({ message: "Department not found or access denied" });
    }

    res.status(200).json(department);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Update Department ----------------
const updateDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, ...updates } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const updatedDept = await Department.findOneAndUpdate(
      { _id: id, createdBy: companyId }, // only allow company's own dept
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedDept) {
      return res.status(404).json({ message: "Department not found or access denied" });
    }

    res.status(200).json({
      message: "Department updated successfully",
      department: updatedDept,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};





// ---------------- Update Employee By Department ----------------
const updateEmployeeByDepartment = async (req, res) => {
  try {
    const { companyId, adminId, employeeId, departmentName } = req.body;
    if(!companyId || !adminId || !employeeId || !departmentName) return res.status(400).json({message:"required field missing."})

    const admin = await Admin.findOne({ _id: adminId, companyId });
    if (!admin) return res.status(403).json({ message: "You are not Authorized." });

    const employee = await Employee.findOne({ _id: employeeId, createdBy: companyId });
    if (!employee) return res.status(404).json({ message: "Employee Not Found." });

    employee.department = departmentName;

    employee.save();

    res.status(200).json({data:employee, message: "Employee’s department has been successfully updated." });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Delete Department ----------------
const deleteDepartment = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "Company ID is required" });
    }

    const deletedDept = await Department.findOneAndDelete({ _id: id, createdBy: companyId });
    if (!deletedDept) {
      return res.status(404).json({ message: "Department not found or access denied" });
    }

    res.status(200).json({ message: "Department deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  updateEmployeeByDepartment
};
