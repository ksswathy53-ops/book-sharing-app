const mongoose = require("mongoose");

mongoose.connect(process.env.URI)
  .then(() => console.log("MongoDB Connected Successfully"))
  .catch((err) => console.log("Mongo Error:", err));

module.exports = mongoose;
