const fs = require("fs");
const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

const path = require("path");

module.exports = async (req, res) => {
  try {
    const shareableLink = req.params.shareableLink;

    // Find the ShareKey by the shareable link
    const shareKey = await ShareKey.findOne({ key: shareableLink });

    if (!shareKey) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const masterPlaylist = path.join(`${process.env.STORAGE_LOCATION}/${shareKey.file.toString()}`, "video.m3u8");

    if (fs.existsSync(masterPlaylist)) {
      // Send the master playlist (m3u8)
      res.sendFile(masterPlaylist);
    } else {
      res.status(404).json({ error: "Video not found." });
    }

  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error viewing file",
    });
  }
};
