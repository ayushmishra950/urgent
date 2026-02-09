const Company = require("../models/companyModel");
const { Admin } = require("../models/authModel");
const Department = require("../models/departmentModel");
const uploadToCloudinary = require("../cloudinary/uploadToCloudinary.js");

/* -------------------------------------------------
   ADD COMPANY (Super Admin only) with Cloudinary Logo
------------------------------------------------- */
const addCompany = async (req, res) => {
  try {
    const { name, domain, address, contactNumber, email, website, isActive, id } = req.body;
    const superAdminId = id; // from auth middleware

    if(!superAdminId){
      return res.status(403).json({ message: "Not Permissions" });
    }

    const admin = await Admin.findById(superAdminId);
    console.log(admin)
    if (admin.role !== "super_admin") {
      return res.status(401).json({ message: "Not authorized" });
    }

    // Upload logo if file exists
    let logoUrl = "";
    if (req.files) {
      logoUrl = await uploadToCloudinary(req?.files?.logo?.[0]?.buffer)
    }
    // Duplicate checks
    // if (domain && (await Company.findOne({ domain })))
    //   return res.status(400).json({ message: "Domain already exists" });

    if (await Company.findOne({ email }))
      return res.status(400).json({ message: "Email already exists" });

  

    const company = await Company.create({
      name,
      domain,
      address,
      contactNumber,
      email,
      website,
      logo: logoUrl,
      isActive: isActive === "true" || isActive === true, // string from FormData or boolean
      createdBy: superAdminId,
      admins: []
    });

    res.status(201).json({
      message: "Company created successfully",
      company
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------
   GET COMPANIES
------------------------------------------------- */
const getCompanies = async (req, res) => {
  try {
    const {id} = req.params;
    const admin = await Admin.findById(id);
    if (!admin) return res.status(401).json({ message: "Unauthorized" });

    // const filter =
    //   admin.role === "super_admin"
    //     ? {}
    //     : { admins: admin._id };

    const companies = await Company.find({createdBy : admin?._id})
      .populate("admins", "username email role")
      .sort({ createdAt: -1 });

    res.status(200).json(companies);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------
   GET COMPANY BY ID
------------------------------------------------- */
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate(
      "admins",
      "username email role"
    );

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json(company);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------
   UPDATE COMPANY
   (Supports logo file upload)
------------------------------------------------- */
const updateCompany = async (req, res) => {
  try {
    const updates = req.body;

    // If a new logo file is uploaded
   let logoUrl = updates.logo || ""; // default current logo

if (req.files?.logo?.length > 0) {
  const fileBuffer = req.files.logo[0].buffer;
  if (fileBuffer) {
    logoUrl = await uploadToCloudinary(fileBuffer);
    updates.logo = logoUrl;
  }
}

    // Convert isActive to boolean
    if (updates.isActive !== undefined) {
      updates.isActive = updates.isActive === "true" || updates.isActive === true;
    }

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({
      message: "Company updated successfully",
      company
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------
   SOFT DELETE COMPANY
------------------------------------------------- */
const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!company) return res.status(404).json({ message: "Company not found" });

    res.status(200).json({ message: "Company disabled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------
   ASSIGN ADMIN TO COMPANY
------------------------------------------------- */
const assignAdmin = async (req, res) => {
  try {
    const { companyId, adminId } = req.body;

    const company = await Company.findById(companyId);
    if (!company) return res.status(404).json({ message: "Company not found" });

    if (company.admins.includes(adminId))
      return res.status(400).json({ message: "Admin already assigned" });

    company.admins.push(adminId);
    await company.save();

    res.status(200).json({ message: "Admin assigned successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

/* -------------------------------------------------
   GET DEPARTMENTS BY COMPANY
------------------------------------------------- */
const getCompanyDepartments = async (req, res) => {
  try {
    const departments = await Department.find({
      companyId: req.params.companyId,
      isActive: true
    });

    res.status(200).json(departments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  addCompany,
  getCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  assignAdmin,
  getCompanyDepartments
};
