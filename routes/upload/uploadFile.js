const fs = require("fs");

require("dotenv").config();

const File = require("../../models/File");

module.exports = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ status: "error", message: "Not logged in!" });
  }

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ status: "error", message: "No files were uploaded!" });
  }

  const uploadedFiles = [req.files.uploadedFile];

  for (let fileKey in uploadedFiles) {
    const uploadedFile = uploadedFiles[fileKey];

    if (!uploadedFile.mimetype.startsWith("video")) {
      return res.status(400).json({ error: "Please upload a valid video file." });
    }

    // Create a new File object with uploaded file information
    const file = new File({
      name: uploadedFile.name,
      size: uploadedFile.size,
      owner: req.user._json.email,
    });

    // Save the file information to MongoDB
    const savedFile = await file.save();

    const outputDir = `${process.env.STORAGE_LOCATION}/${savedFile._id}`; // Folder for upload

    // Create directory for File Upload
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Use the mv() method to place the file somewhere on your server
    uploadedFile.mv(`${outputDir}/original`, function (err) {
      if (err) return res.status(500).send(err);

      return res.status(200).json({ message: `Success`, id: savedFile._id });
    });
  }
};
