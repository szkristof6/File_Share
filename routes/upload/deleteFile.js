const fs = require("fs");
const File = require("../../models/File");

module.exports = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ status: "error", message: "Not logged in!" });
  }

  const fileId = req.params.id;

  try {
    await File.findByIdAndDelete(fileId);

    // Remove the file from the 'uploads' directory
    fs.rmSync(`${process.env.STORAGE_LOCATION}/${fileId}`, { recursive: true, force: true });

    return res.json({
      status: "success",
      message: "File removed successfully",
    });
    
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};
