const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");
const fs = require('fs');
const File = require("../../models/File");

module.exports = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ status: "error", message: "No files were uploaded!" });
  }

  const uploadedFiles = [req.files.uploadedFile];

  for (let fileKey in uploadedFiles) {
    const uploadedFile = uploadedFiles[fileKey];

    // Generate a unique identifier (UUID) for the file
    const uniqueIdentifier = `${uuidv4()}-${Date.now()}`; // Combining UUID with current timestamp

    // Create a new File object with uploaded file information
    const file = new File({
      name: uploadedFile.name,
      size: uploadedFile.size,
      mimeType: uploadedFile.mimetype,
      md5: uploadedFile.md5,
      path: `${process.cwd()}/uploads/${uniqueIdentifier}`, // This assumes files are stored in the 'uploads' directory
      owner: req.user._json.email,
    });

    // Save the file information to MongoDB
    await file.save();

    // Use the mv() method to place the file somewhere on your server
    uploadedFile.mv(file.path, function (err) {
      if (err) return res.status(500).send(err);

      // Read the file to calculate MD5 hash
      const fileData = fs.readFileSync(file.path);

      const md5sum = crypto.createHash("md5");
      const calculatedMD5 = md5sum.update(fileData).digest("hex");

      const fileMD5 = file.md5; // MD5 checksum provided by express-fileupload

      // Perform file verification using the checksums
      if (fileMD5 !== calculatedMD5) {
        // Handle verification failure (checksums don't match)
        fs.unlinkSync(filePath); // Remove the file if verification fails
        return res.status(400).send("MD5 checksum verification failed for " + file.name);
      }

      return res.json({
        status: "success",
        message: "Successfull upload!",
      });
    });
  }
};
