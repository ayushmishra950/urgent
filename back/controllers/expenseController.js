const { Expense } = require("../models/expenseModel.js");
const Company = require("../models/companyModel");
const recentActivity = require("../models/recentActivityModel.js");

// ---------------- Add Expense ----------------
const addExpense = async (req, res) => {
  try {
    const { date, amount, category, paidBy, notes, companyId, userId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // ✅ Validate company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Invalid company ID" });
    }

    const newExpense = new Expense({
      date,
      amount,
      category,
      paidBy,
      notes: notes || null,
      createdBy: company._id, // save company as creator
    });

    await newExpense.save();

     await recentActivity.create({title:"New Expense Added.", createdBy:userId, createdByRole:"Admin", companyId:companyId})
    

    return res.status(201).json({
      message: "Expense added successfully",
      expense: newExpense,
    });
  } catch (err) {
    console.error("Add Expense Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Get All Expenses ----------------
const getExpenses = async (req, res) => {
  try {
    const { companyId } = req.params; // frontend can send companyId in query

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const expenses = await Expense.find({ createdBy: companyId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (err) {
    console.error("Get Expenses Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Get Expense by ID ----------------
const getExpenseById = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    const expense = await Expense.findOne({ _id: id, createdBy: companyId });
    if (!expense) {
      return res.status(404).json({ message: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (err) {
    console.error("Get Expense By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Update Expense ----------------
const updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId, ...updates } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // ✅ Validate company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Invalid company ID" });
    }

    const updatedExpense = await Expense.findOneAndUpdate(
      { _id: id, createdBy: company._id },
      updates,
      { new: true, runValidators: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({ message: "Expense not found or not authorized" });
    }

    res.status(200).json({
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (err) {
    console.error("Update Expense Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ---------------- Delete Expense ----------------
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;

    if (!companyId) {
      return res.status(400).json({ message: "companyId is required" });
    }

    // ✅ Validate company
    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: "Invalid company ID" });
    }

    const deletedExpense = await Expense.findOneAndDelete({ _id: id, createdBy: company._id });
    if (!deletedExpense) {
      return res.status(404).json({ message: "Expense not found or not authorized" });
    }

    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (err) {
    console.error("Delete Expense Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
