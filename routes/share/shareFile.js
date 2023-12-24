const { v4: uuidv4 } = require("uuid");
const ShareKey = require("../../models/ShareKey");

module.exports = async (req, res) => {
  try {
    const fileId = req.params.id;

    // Generate a new unique identifier (URL token) for sharing
    const shareableLink = uuidv4();

    // Create a new ShareKey and associate it with the specified file
    const shareKey = new ShareKey({
      key: shareableLink,
      file: fileId,
    });

    // Save the share key to MongoDB
    await shareKey.save();

    res.json({ shareableLink });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error sharing file",
    });
  }
};
