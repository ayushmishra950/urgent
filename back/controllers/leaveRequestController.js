const mongoose = require("mongoose");
const { LeaveRequest } = require("../models/leaveRequestModel");
const { Leave } = require("../models/leaveModel");
const Company = require("../models/companyModel");
const recentActivity = require("../models/recentActivityModel.js");

/**
 * APPLY LEAVE (Employee)
 */
const applyLeave = async (req, res) => {
  try {
    const {
      leaveType,
      fromDate,
      toDate,
      description,
      userId,
      companyId,
    } = req.body;

    // Basic validation
    if (!leaveType || !fromDate || !toDate || !companyId) {
      return res.status(400).json({
        success: false,
        message: "Leave type, dates and company ID are required",
      });
    }

    if (
      !mongoose.Types.ObjectId.isValid(leaveType) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid leave type or company ID",
      });
    }

    // Company validation
    const companyExists = await Company.findById(companyId);
    if (!companyExists) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    const start = new Date(fromDate);
    const end = new Date(toDate);

    if (start > end) {
      return res.status(400).json({
        success: false,
        message: "From date cannot be greater than to date",
      });
    }

    // Calculate total days
    const totalDays =
      Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

    // Check leave type exists
    const leave = await Leave.findById(leaveType);
    if (!leave) {
      return res.status(404).json({
        success: false,
        message: "Leave type not found",
      });
    }

    if (totalDays > leave.maxDaysAllowed) {
      return res.status(400).json({
        success: false,
        message: `Maximum ${leave.maxDaysAllowed} days allowed for this leave`,
      });
    }

    const leaveRequest = await LeaveRequest.create({
      user: userId,
      leaveType,
      fromDate: start,
      toDate: end,
      totalDays,
      description,
      createdBy: companyId, // ✅ company saved here
    });

     await recentActivity.create({title:`${leaveRequest?.leaveType} applied.`, createdBy:userId, createdByRole:"Employee", companyId:companyId})
    return res.status(201).json({
      success: true,
      message: "Leave applied successfully",
      leaveRequest,
    });
  } catch (error) {
    console.error("Apply Leave Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET MY LEAVE REQUESTS (Employee - Company wise)
 */
const getMyLeaveRequests = async (req, res) => {
  try {
     const{userId} = req.params;
    const {companyId } = req.query;
    if (
      !mongoose.Types.ObjectId.isValid(userId) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid user or company ID",
      });
    }

    const requests = await LeaveRequest.find({
      user: userId,
      createdBy: companyId,
    })
      .populate("leaveType", "name paid")
      .populate("user", "fullName email profileImage")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get My Leaves Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET ALL LEAVE REQUESTS (Admin / Company)
 */
const getAllLeaveRequests = async (req, res) => {
  try {
    const { companyId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid company ID",
      });
    }

    const requests = await LeaveRequest.find({ createdBy: companyId })
      .populate("user", "fullName email profileImage")
      .populate("leaveType", "name paid color")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error("Get All Leave Requests Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * GET LEAVE REQUEST BY ID (Company safe)
 */
const getLeaveRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.query;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const request = await LeaveRequest.findOne({
      _id: id,
      createdBy: companyId,
    })
      .populate("user", "name email")
      .populate("leaveType", "name paid");

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error("Get Leave Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * APPROVE / REJECT LEAVE (Admin / Company)
 */
const updateLeaveStatus = async (req, res) => {
  try {
    const { status, requestId, companyId, userId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(requestId) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid request or company ID",
      });
    }

    if (!["Approved", "Rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be Approved or Rejected",
      });
    }

    const leaveRequest = await LeaveRequest.findOne({
      _id: requestId,
      createdBy: companyId,
      status: "Pending",
    });

    if (!leaveRequest) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found or already processed",
      });
    }

    leaveRequest.status = status;
    await leaveRequest.save();

    await recentActivity.create({title:`leave ${status}`, createdBy:userId, createdByRole:"Admin", companyId:companyId})

    return res.status(200).json({
      success: true,
      message: `Leave ${status.toLowerCase()} successfully`,
      leaveRequest,
    });
  } catch (error) {
    console.error("Update Leave Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

/**
 * DELETE LEAVE REQUEST (Company safe)
 */
const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { companyId } = req.body;

    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(companyId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid ID",
      });
    }

    const request = await LeaveRequest.findOneAndDelete({
      _id: id,
      createdBy: companyId,
    });

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Leave request not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Leave request deleted successfully",
    });
  } catch (error) {
    console.error("Delete Leave Request Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  applyLeave,
  getMyLeaveRequests,
  getAllLeaveRequests,
  getLeaveRequestById,
  updateLeaveStatus,
  deleteLeaveRequest,
};
