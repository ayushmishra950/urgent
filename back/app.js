
// const express = require("express");
// const mongoose = require("mongoose");
// const dotenv = require("dotenv");
// const cors = require("cors");
// const swaggerUI = require("swagger-ui-express");

// const { connectDB } = require("./config/db.js");
// const authRoutes = require("./routes/authRoute.js");
// const employeesRoutes = require("./routes/employeesRoute.js");
// const expenseRoutes = require("./routes/expenseRoutes.js");
// const departmentRoutes = require("./routes/departmentRoutes.js");
// const expenseCategoryRoutes = require("./routes/expenseCategoryRoutes.js");
// const pdfLetterRoutes = require("./routes/pdfLetterRoute.js");
// const roleRoutes = require("./routes/roleRoutes.js");
// const permissionRoutes = require("./routes/permissionRoutes.js");
// const sidebarRoutes = require("./routes/sidebarRoutes.js");
// const leaveRoutes = require("./routes/leaveRoutes.js");
// const leaveRequestRoutes = require("./routes/leaveRequestRoutes.js");
// const attendanceRoutes = require("./routes/attendanceRoute.js");
// const payRollRoutes = require("./routes/payRollRoute.js");
// const companyRoutes = require("./routes/companyRoutes.js");
// const taskRoutes = require("./routes/taskRoutes.js");


// const { authMiddleware } = require("./middleware/authMiddleware.js");
// const swaggerSpec = require("./swagger"); // 👈 swagger config

// // Load env
// dotenv.config();

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Connect DB
// connectDB();

// // Middlewares
// app.use(express.json());
// app.use(
//   cors({
//     origin: "http://localhost:8080",
//     credentials: true,
//   })
// );

// // 🔹 Swagger Route
// app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// // Routes
// app.use("/api/auth", authRoutes);
// app.use("/api/employees", employeesRoutes);
// app.use("/api/expenses", expenseRoutes);
// app.use("/api/departments", departmentRoutes);
// app.use("/api/expense-categories",  expenseCategoryRoutes);
// app.use("/api/pdfGenerater", pdfLetterRoutes);
// app.use("/api/role",authMiddleware, roleRoutes);
// app.use("/api/permissions", permissionRoutes);
// app.use("/api/sidebars", sidebarRoutes);
// app.use("/api/leaves", leaveRoutes);
// app.use("/api/leave-requests", leaveRequestRoutes);
// app.use("/api/attendance", attendanceRoutes);
// app.use("/api/payRollRoutes", payRollRoutes);
// app.use("/api/company", companyRoutes);
// app.use("/api/task", taskRoutes);

// // Test route
// app.get("/", (req, res) => {
//   res.send("OMS Admin System is running!");
// });

// // server.js / app.js me
// app.get('/test-db', async (req, res) => {
//   try {
//     // Try to list collections
//     const collections = await mongoose.connection.db.listCollections().toArray();
//     res.status(200).json({
//       message: "MongoDB connected!",
//       collections,
//     });
//   } catch (err) {
//     console.error("MongoDB connection test error:", err);
//     res.status(500).json({
//       message: "MongoDB connection failed",
//       error: err.message,
//     });
//   }
// });


// // Server
// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
//   console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
// });

























// server.js
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const swaggerUI = require("swagger-ui-express");
const http = require("http");

const { connectDB } = require("./config/db.js");
const authRoutes = require("./routes/authRoute.js");
const employeesRoutes = require("./routes/employeesRoute.js");
const expenseRoutes = require("./routes/expenseRoutes.js");
const departmentRoutes = require("./routes/departmentRoutes.js");
const expenseCategoryRoutes = require("./routes/expenseCategoryRoutes.js");
const pdfLetterRoutes = require("./routes/pdfLetterRoute.js");
const leaveRoutes = require("./routes/leaveRoutes.js");
const leaveRequestRoutes = require("./routes/leaveRequestRoutes.js");
const attendanceRoutes = require("./routes/attendanceRoute.js");
const payRollRoutes = require("./routes/payRollRoute.js");
const companyRoutes = require("./routes/companyRoutes.js");
const taskRoutes = require("./routes/taskRoutes.js");

const swaggerSpec = require("./swagger");
const { initSocket } = require("./socketHelpers.js"); // ✅ import only initSocket

// Load env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect DB
connectDB();

// Middlewares
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);

// Swagger
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeesRoutes);
app.use("/api/expenses", expenseRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/expense-categories", expenseCategoryRoutes);
app.use("/api/pdfGenerater", pdfLetterRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/leave-requests", leaveRequestRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/payRollRoutes", payRollRoutes);
app.use("/api/company", companyRoutes);
app.use("/api/task", taskRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("OMS Admin System is running!");
});

// MongoDB test route
app.get("/test-db", async (req, res) => {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    res.status(200).json({ message: "MongoDB connected!", collections });
  } catch (err) {
    res.status(500).json({ message: "MongoDB connection failed", error: err.message });
  }
});

// ========================
// Socket.io setup
// ========================
const server = http.createServer(app);

// ✅ Only call your helper function here
initSocket(server);

// ========================
// Start server
// ========================
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log(`Swagger Docs: http://localhost:${PORT}/api-docs`);
});
