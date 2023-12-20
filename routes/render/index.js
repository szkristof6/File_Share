const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

// Function to format bytes to appropriate units
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

module.exports = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const files = await File.find({}); // Fetch all files from the database
      const shareKeys = await ShareKey.find(); // Fetch all share keys from the database

      // Iterate through each file to determine isShared status
      const filesWithSharedStatus = files.map((file) => {
        const shareableLink = shareKeys.find((shareKey) => shareKey.file.toString() === file._id.toString());

        const fileObject = file.toObject();

        const object = {
          _id: fileObject._id,
          name: fileObject.name,
          size: formatBytes(fileObject.size),
          type: fileObject.mimeType,
        }; // Add isShared property to the file object

        if (shareKeys.length > 0) {
          return {
            ...object,
            isShared: shareableLink !== undefined,
            shareableLink: shareableLink !== undefined && shareableLink.key,
          };
        } else {
          return object;
        }
      });

      res.render("index", { files: filesWithSharedStatus, user: req.user._json });
    } catch (err) {
      console.error("Error fetching files:", err);
      res.status(500).send("Error fetching files");
    }
  } else {
    res.redirect("/auth/google"); // Redirect to login if user is not authenticated
  }
};
