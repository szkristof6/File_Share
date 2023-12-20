const { v4: uuidv4 } = require("uuid");
const File = require("../../models/File");

module.exports = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res
      .status(400)
      .send({ status: "error", message: "No files were uploaded!" });
  }

  const uploadedFile = req.files.uploadedFile;

  // Generate a unique identifier (UUID) for the file
  const uniqueIdentifier = `${uuidv4()}-${Date.now()}`; // Combining UUID with current timestamp
  
  // Create a new File object with uploaded file information
  const file = new File({
    name: uploadedFile.name,
    size: uploadedFile.size,
    mimeType: uploadedFile.mimetype,
    md5: uploadedFile.md5,
    path: `${process.cwd()}/uploads/${uniqueIdentifier}`, // This assumes files are stored in the 'uploads' directory
    owner: req.user._json.email
  });

  // Save the file information to MongoDB
  await file.save();

  // Use the mv() method to place the file somewhere on your server
  uploadedFile.mv(file.path, function (err) {
    if (err) return res.status(500).send(err);

    res.json({
      status: "success",
      message: "Successfull upload!",
    });
  });
};
