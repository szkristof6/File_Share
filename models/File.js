const mongoose = require("mongoose");

// Create a Mongoose Schema for file information
const fileSchema = new mongoose.Schema({
  name: String,
  size: Number,
  owner: String,
});

module.exports = mongoose.model("File", fileSchema);
