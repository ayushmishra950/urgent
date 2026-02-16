const { Server } = require("socket.io");
const Notification = require("./models/NotificationModel"); // Notification model

let io;

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "https://urgent-frontend-3jiy.onrender.com",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);

    socket.on("joinRoom", (roomId) => {
      socket.join(roomId.toString());
      console.log(`${socket.id} joined room: ${roomId}`);
    });

    socket.on("disconnect", () => {
      console.log("Client disconnected:", socket.id);
    });
  });
}

/**
 * Send notification: save in DB and emit via socket
 * @param {string} userId - User ObjectId
 * @param {string} userModel - "Admin" or "Employee"
 * @param {string} companyId - Company ObjectId
 * @param {string} message - Notification message
 * @param {string} type - "task" | "subtask" | "leave" | "general"
 * @param {string|null} referenceId - Related Task/Leave/Subtask ID
 */


async function sendNotification({createdBy,userId, userModel, companyId, message, type = "general", referenceId = null}) {
  if (!io) return console.error("Socket.io not initialized");
  console.log(createdBy , userId ,userModel ,companyId ,message ,type ,referenceId, )
  // if(!createdBy || !userId ||!userModel || !companyId || !message || !type ||  !referenceId) return {message : " required field missing."}
   
  try {
    // 1️⃣ Save in MongoDB
   const notificationDoc = await Notification.create({
  userId,
  userModel,   // required
  companyId,   // required
  message,
  type,
  referenceId,
  createdBy
});

// Populate createdBy for frontend display
const notification = await notificationDoc.populate("createdBy");


    // 2️⃣ Emit via socket to the user
    io.to(userId.toString()).emit("newNotification", notification);

    console.log("Notification sent:", notification);

  } catch (err) {
    console.error("Send notification error:", err);
  }
}

module.exports = { initSocket, sendNotification };
