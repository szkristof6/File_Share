const fs = require("fs");
const path = require("path");

const File = require("../../models/File");

require("dotenv").config();

const { conversionList } = require("../utils");

module.exports = async (req, res) => {
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

  const segmentId = req.params.segmentId;
  const segmentPath = path.join(process.env.STORAGE_LOCATION, file._id.toString(), `${resolution}p_segments`, `${resolution}_${segmentId}.ts`);

  console.log(segmentPath);

  if (fs.existsSync(segmentPath)) {
    // Send the segment file
    res.sendFile(segmentPath);
  } else {
    res.status(404).json({ error: "Segment not found." });
  }
};