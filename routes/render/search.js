const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

const { formatBytes, getStorageSpace, sortByName, sortByViews, sortBySize, sortByType } = require("./utils");

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function searchByName(list, filter) {
  return list.filter((row) => {
    if (row.name.toUpperCase().indexOf(filter) > -1) {
      return true;
    }

    return false;
  });
}

module.exports = async (req, res) => {
  if (req.isAuthenticated()) {
    try {
      const files = await File.find({}); // Fetch all files from the database
      const shareKeys = await ShareKey.find(); // Fetch all share keys from the database

      // Iterate through each file to determine isShared status
      let filesWithSharedStatus = files.map((file) => {
        const shareableLink = shareKeys.find((shareKey) => shareKey.file.toString() === file._id.toString());

        const fileObject = file.toObject();

        const object = {
          _id: fileObject._id,
          name: fileObject.name,
          size: fileObject.size,
          type: fileObject.mimeType,
        }; // Add isShared property to the file object

        if (shareKeys.length > 0) {
          return {
            ...object,
            isShared: shareableLink !== undefined,
            shareableLink: shareableLink !== undefined && shareableLink.key,
            viewCount: shareableLink !== undefined ? shareableLink.views : 0,
          };
        } else {
          return object;
        }
      });

      const queryParams = req.query;

      if (queryParams) {
        if (queryParams.sort === "name") {
          sortByName(filesWithSharedStatus, queryParams.dir);
        } else if (queryParams.sort === "size") {
          sortBySize(filesWithSharedStatus, queryParams.dir);
        } else if (queryParams.sort === "type") {
          sortByType(filesWithSharedStatus, queryParams.dir);
        } else if (queryParams.sort === "views") {
          sortByViews(filesWithSharedStatus, queryParams.dir);
        } else {
          sortByName(filesWithSharedStatus);
        }

        if (queryParams.search) {
          filesWithSharedStatus = searchByName(filesWithSharedStatus, queryParams.search);
        }
      }

      res.render("search", {
        files: filesWithSharedStatus.map((file) => ({ ...file, size: formatBytes(file.size) })),
        user: req.user._json,
        diskSpace: await getStorageSpace(),
        sort: isEmpty(queryParams) ? { sort: "name", dir: "asc" } : queryParams,
      });
    } catch (err) {
      console.log(err);
      return res.status(500).json({
        status: "error",
        message: "Error fetching files",
      });
    }
  } else {
    return res.redirect("/auth/google"); // Redirect to login if user is not authenticated
  }
};
