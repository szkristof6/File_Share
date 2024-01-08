const fs = require("fs");
const File = require("../../models/File");

const path = require("path");

module.exports = async (req, res) => {
  try {
    const link = req.params.link;

    // Find the ShareKey by the shareable link
    const file = await File.findById(link);

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const masterPlaylist = path.join(`${process.env.STORAGE_LOCATION}/${link.toString()}`, "master.m3u8");

    if (fs.existsSync(masterPlaylist)) {
      // Send the master playlist (m3u8)
      res.sendFile(masterPlaylist);
    } else {
      res.status(404).json({ error: "Video not found." });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Error viewing file",
    });
  }
};
