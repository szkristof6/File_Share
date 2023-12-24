const ShareKey = require("../../models/ShareKey");

module.exports = async (req, res) => {
  try {
    const fileId = req.params.id;

    // Find and delete the associated share link
    const shareLink = await ShareKey.findOneAndDelete({ file: fileId });

    if (!shareLink) {
      return res.status(404).json({
        status: "error",
        message: "Share link not found",
      });
    }

    return res.json({
      status: "success",
      message: "Share link removed!",
    });
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error removing share link",
    });
  }
};
