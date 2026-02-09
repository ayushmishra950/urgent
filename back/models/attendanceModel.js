const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AttendanceSchema = new Schema(
  {
    date: { type: Date, required: true },
    userId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    status: { type: String, enum: ["Present", "Absent", "Half Day", "Late", "Clocked In"], default: "Clocked In" },
    clockIn: { type: String, default: "-" },   // HH:MM
    clockOut: { type: String, default: "-" },  // HH:MM
    hoursWorked: { type: Number, default: 0 },
    createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Company",
            required: true,
          },
  },
  { timestamps: true }
);

module.exports = model("Attendance", AttendanceSchema);
