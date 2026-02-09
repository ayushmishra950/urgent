const mongoose = require("mongoose");

const EmployeeSalarySchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
              ref: "Employee",
              default: null
    },
    departmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
        default: null
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    basic: {
        type: Number,
        required: true
    },
    allowance: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
          },
}, {
    timestamps: true
});

module.exports = mongoose.model("EmployeeSalary", EmployeeSalarySchema);
