const fs = require("fs");
const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

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

    // Find the file associated with the ShareKey
    const file = await File.findById(shareKey.file);

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const range = req.headers.range;
    if (range) {
      const stat = fs.statSync(file.path);
      const fileSize = stat.size;

      const CHUNK_SIZE = 10 ** 6; // 1MB chunk size (adjust as needed)
      const start = Number(range.replace(/\D/g, ""));
      const end = Math.min(start + CHUNK_SIZE, fileSize - 1);

      const contentLength = end - start + 1;

      const headers = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": file.mimeType,
      };

      res.writeHead(206, headers);

      const fileStream = fs.createReadStream(file.path, { start, end });
      fileStream.pipe(res);
    } else {
      // Stream the entire video if no range is provided
      const fileStream = fs.createReadStream(file.path);
      fileStream.pipe(res);
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error viewing file",
    });
  }
};
