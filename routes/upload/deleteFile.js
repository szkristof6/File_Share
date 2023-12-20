const fs = require("fs");
const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

module.exports = async (req, res) => {
  const fileId = req.params.id;

  // Find the file by its _id and remove it from the database
  const file = await File.findById(fileId);

  // Remove the file from the 'uploads' directory
  fs.unlink(file.path, (err) => {
    if (err) {
      console.error("Error removing file:", err);
      res.status(500).send("Error removing file");
    } else {
      res.send("File removed successfully");
    }
  });

  await ShareKey.findOneAndDelete({ file: fileId });
  await File.findOneAndDelete({ _id: fileId });
};
