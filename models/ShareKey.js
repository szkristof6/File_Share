const mongoose = require("mongoose");

// Create a Mongoose Schema for share keys
const shareKeySchema = new mongoose.Schema({
  key: String,
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "File",
  },
});

module.exports = mongoose.model("ShareKey", shareKeySchema);
