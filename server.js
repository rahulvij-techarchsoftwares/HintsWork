const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const http = require("http"); 
const { Server } = require("socket.io");
const connectDB = require("./db/connectdb");
const cors = require('cors');
const roleRoutes = require("./routes/roleRoutes");
const authRoutes = require("./routes/userRoutes");
const bookdemoformRoutes = require("./routes/bookdemoformRoutes");
const brandRoutes = require("./routes/brandRoutes");
const sponsorRoutes = require("./routes/sponsorRoutes");
const jwt = require('jsonwebtoken');
const { authenticateSocket } = require("./controllers/userController");

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true, 
  },
});

app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"],
  credentials: true,
}));


app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  req.io = io;
  next();
});


app.use("/api", roleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", bookdemoformRoutes);
app.use("/brands", brandRoutes);
app.use("/sponsers", sponsorRoutes);




const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
