const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },

//   domain: {
//   type: String,
//   unique: true,
//   required: [true, "Domain is required"]
// },

  email: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true
  },

  contactNumber: { 
    type: String, 
    required: true 
  },

  website: { type: String },

  logo: { 
    type: String   // 👈 logo URL / path
  },

  address: { type: String },

  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin', 
    required: true 
  },

  admins: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Admin' 
  }],

  isActive: { 
    type: Boolean, 
    default: true 
  }

}, { timestamps: true }); // 👈 createdAt & updatedAt auto

module.exports = mongoose.model('Company', companySchema);
