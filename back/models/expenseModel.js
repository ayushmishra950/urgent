const mongoose = require("mongoose");

// Expense Schema
const expenseSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    required: true,
    trim: true,
  },
  paidBy: {
    type: String,
    required: true,
    trim: true,
  },
  createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
          },
  notes: {
    type: String,
    trim: true,
    default: null, // optional field
  },
}, { timestamps: true }); // automatically adds createdAt and updatedAt

// Create Expense model
const Expense = mongoose.model("Expense", expenseSchema);

module.exports = { Expense };
