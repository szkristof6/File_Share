const ShareKey = require("../../models/ShareKey");

module.exports = async (req, res) => {
  try {
    const fileId = req.params.id;

    // Find and delete the associated share link
    const shareLink = await ShareKey.findOneAndDelete({ file: fileId });

    if (!shareLink) {
      return res.status(404).send("Share link not found");
    }

    res.status(200).send("Share link removed");
  } catch (err) {
    console.error("Error removing share link:", err);
    res.status(500).send("Error removing share link");
  }
};
