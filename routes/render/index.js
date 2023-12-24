const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

const { formatBytes, getStorageSpace } = require("./utils");

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
            viewCount: shareableLink !== undefined && shareableLink.views,
          };
        } else {
          return object;
        }
      });

      res.render("index", {
        files: filesWithSharedStatus,
        user: req.user._json,
        diskSpace: await getStorageSpace()
      });
    } catch (err) {
      console.error("Error fetching files:", err);
      res.status(500).send("Error fetching files");
    }
  } else {
    res.redirect("/auth/google"); // Redirect to login if user is not authenticated
  }
};
