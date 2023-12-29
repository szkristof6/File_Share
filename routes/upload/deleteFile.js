const fs = require("fs");
const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

module.exports = async (req, res) => {
  const fileId = req.params.id;

  // Remove the file from the 'uploads' directory
  fs.rm(`${process.env.STORAGE_LOCATION}/${fileId}`, { recursive: true, force: true }, (err) => {
    if (err) {
      return res.status(500).json({
        status: "error",
        message: err.message,
      });
    } else {
      return res.json({
        status: "success",
        message: "File removed successfully",
      });
    }
  });

  await ShareKey.findOneAndDelete({ file: fileId });
  await File.findOneAndDelete({ _id: fileId });
};
