const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

module.exports = async (req, res) => {
  const shareableLink = req.params.shareableLink;

  // Find the ShareKey by the shareable link
  const shareKey = await ShareKey.findOne({ key: shareableLink });

  if (!shareKey) {
    return res.status(404).json({
      status: "error",
      message: "File not found",
    });
  }

  // Find the file associated with the ShareKey
  const file = await File.findById(shareKey.file);

  if (!file) {
    return res.status(404).json({
      status: "error",
      message: "File not found",
    });
  }

  const updatedViews = (shareKey.views += 1);

  await ShareKey.updateOne({ key: shareableLink }, { views: updatedViews });

  if (file.mimeType.startsWith("audio")) {
    // Render audio template
    res.render("audio", { shareableLink, name: file.name });
  } else if (file.mimeType.startsWith("video")) {
    // Render video template
    res.render("video", { shareableLink, mimeType: file.mimeType });
  }
};
