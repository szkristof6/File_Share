const fs = require("fs");

const File = require("../../models/File");

const path = require("path");

const { conversionList } = require("../utils");

module.exports = async (req, res) => {
  try {
    const { link, resolution } = req.params;

    if (!conversionList.some((e) => e.height === Number(resolution))) {
      return res.status(404).json({
        status: "error",
        message: "Invalid resolution",
      });
    }

    // Find the ShareKey by the shareable link
    const file = await File.findOne({ link });

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const masterPlaylist = path.join(`${process.env.STORAGE_LOCATION}/${file._id.toString()}`, `${resolution}p.m3u8`);

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
