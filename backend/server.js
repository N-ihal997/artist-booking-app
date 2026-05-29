const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const artistRoutes = require("./routes/artists");
const bookingRoutes = require("./routes/bookings");
const paymentRoutes = require("./routes/payments");
const messageRoutes = require("./routes/messages");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/artists", artistRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/messages", messageRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Artist booking API is running" });
});

// Socket.io real-time chat
io.on("connection", (socket) => {
  console.log("User connected: " + socket.id);

  // Join a booking room
  socket.on("join_room", (bookingId) => {
    socket.join(bookingId);
    console.log("User joined room: " + bookingId);
  });

  // Send message
  socket.on("send_message", (data) => {
    io.to(data.bookingId).emit("receive_message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected: " + socket.id);
  });
});

server.listen(PORT, () => {
  console.log("Server running on http://localhost:" + PORT);
});