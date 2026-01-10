const express = require("express");
const cors = require("cors");
require("dotenv").config();
require("./db");

const app = express();

app.use(cors());
app.use(express.json());


// Serve uploaded files
app.use("/uploads", express.static("uploads"));


// Routes
const userRoutes = require("./routes/userRoutes");
const bookRoutes = require("./routes/bookRoutes");
const bookRequestRoutes = require("./routes/bookRequestRoutes");
const profileRoutes = require("./routes/profileRoutes");

app.use("/api/users", userRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/request", bookRequestRoutes);
app.use("/api/profile", profileRoutes);

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});