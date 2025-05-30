import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import authRouter from './routes/auth.route.js';
import activityRouter from './routes/activity.route.js';
import hostRouter from './routes/host.route.js';
import usersRouter from './routes/users.route.js';
import studyGroupsRouter from './routes/groups.route.js';
import mlActivityRouter from './routes/ml-activity.route.js';
import adminRouter from './routes/admin.route.js';
import { authenticateToken } from './middleware/auth.js';

const prisma = new PrismaClient();

const app = express();

// Global health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

const server = createServer(app); // Create an HTTP server
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"], // Allow frontend requests
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});
   
app.use(cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Authentication middleware is now imported from './middleware/auth.js'

// Routes that don't require authentication
app.use("/api/auth", authRouter);

// Create a separate router for admin login
const adminLoginRouter = express.Router();
adminLoginRouter.post("/login", async (req, res) => {
  try {
    console.log("Request Body:", req.body);

    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Find the admin user by isAdmin flag only
    const admin = await prisma.$queryRaw`
      SELECT * FROM "users" WHERE "emailaddress" = 'admin@example.com' AND "isAdmin" = true;
    `;

    console.log("Raw Query Result:", admin);

    // Check if an admin was returned
    if (!admin || admin.length === 0) {
      console.log("Admin not found with email admin@example.com");
      return res.status(401).json({ message: "Admin not found" });
    }

    // Admin data is in admin[0] since it's returned as an array
    const adminData = admin[0];

    // Log the hashed password from the database and the plain password for comparison
    console.log("Database Hashed Password:", adminData.password);
    console.log("Plain Text Password:", password);

    // Compare the plain text password with the hashed password in the database
    const validPassword = await bcrypt.compare(password, adminData.password);

    console.log("Password verification result:", validPassword);

    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate the JWT token
    const token = jwt.sign(
      {
        userId: adminData.id,
        email: adminData.emailaddress,
        isAdmin: adminData.isAdmin,
      },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "24h" }
    );

    // Send the response with user data and token
    res.json({
      user: {
        id: adminData.id,
        name: adminData.name,
        email: adminData.emailaddress,
        isAdmin: adminData.isAdmin,
      },
      token,
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// Mount the admin login router
app.use("/api/admin", adminLoginRouter);

// Apply authentication middleware to all other routes
app.use(authenticateToken);

// Mount routes that require authentication
app.use("/api/activities", activityRouter);
app.use("/api/host", hostRouter);
app.use("/api/groups", studyGroupsRouter);
app.use("/api/users", usersRouter);
app.use("/api/ml-activity", mlActivityRouter);
app.use("/api/admin", adminRouter);

// Socket.io logic
io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle joining a room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  // Handle chat messages
  socket.on("send_message", (data) => {
    // Broadcast the message to all users in the room
    socket.to(data.roomId).emit("receive_message", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});


// Start server
const PORT = process.env.PORT || 5001; 
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
