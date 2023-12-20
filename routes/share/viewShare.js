const fs = require("fs");
const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

module.exports = async (req, res) => {
  try {
    const shareableLink = req.params.shareableLink;

    // Find the ShareKey by the shareable link
    const shareKey = await ShareKey.findOne({ key: shareableLink });

    if (!shareKey) {
      return res.status(404).send("File not found");
    }

    // Find the file associated with the ShareKey
    const file = await File.findById(shareKey.file);

    if (!file) {
      return res.status(404).send("File not found");
    }

    // Set appropriate Content-Type header
    res.setHeader("Content-type", file.mimeType);

    // Read the file and send it as a response
    const fileStream = fs.createReadStream(file.path);
    fileStream.pipe(res);
  } catch (err) {
    console.error("Error viewing file:", err);
    res.status(500).send("Error viewing file");
  }
};
