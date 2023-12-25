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
      
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : file.size - 1;
      const contentLength = end - start + 1;
      
      const headers = {
        "Content-Range": `bytes ${start}-${end}/${file.size}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": file.mimeType,
      };

      res.writeHead(206, headers);

      const fileStream = fs.createReadStream(file.path, { start, end });
      fileStream.pipe(res);
    } else {
      const head = {
        "Content-Length": file.size,
        "Content-Type": file.mimeType,
      };
      res.writeHead(200, head);
      fs.createReadStream(file.path).pipe(res);
    }
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Error viewing file",
    });
  }
};
