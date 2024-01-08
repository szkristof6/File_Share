const mongoose = require("mongoose");

// Create a Mongoose Schema for file information
const fileSchema = new mongoose.Schema({
  name: String,
  size: Number,
  owner: String,
  converted: {
    type: Boolean,
    default: false,
  },
  views: {
    type: Number,
    default: 0,
  },
});

module.exports = mongoose.model("File", fileSchema);
