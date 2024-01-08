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
    const file = await File.findById(link);

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const playlist = path.join(process.env.STORAGE_LOCATION, link, `${resolution}p.m3u8`);

    if (fs.existsSync(playlist)) {
      // Send the master playlist (m3u8)
      res.sendFile(playlist);
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
