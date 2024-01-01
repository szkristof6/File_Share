const fs = require("fs");
const path = require("path");

const ShareKey = require("../../models/ShareKey");

require("dotenv").config();

const { conversionList } = require("../utils");

module.exports = async (req, res) => {
  const { shareableLink, resolution } = req.params;

  if (!conversionList.some((e) => e.height === Number(resolution))) {
    return res.status(404).json({
      status: "error",
      message: "Invalid resolution",
    });
  }

  // Find the ShareKey by the shareable link
  const shareKey = await ShareKey.findOne({ key: shareableLink });

  if (!shareKey) {
    return res.status(404).json({
      status: "error",
      message: "File not found",
    });
  }

  const segmentId = req.params.segmentId;
  const segmentPath = path.join(process.env.STORAGE_LOCATION, shareKey.file.toString(), `${resolution}p_segments`, `${resolution}_segment_${segmentId}.ts`);

  if (fs.existsSync(segmentPath)) {
    // Send the segment file
    res.sendFile(segmentPath);
  } else {
    res.status(404).json({ error: "Segment not found." });
  }
};
