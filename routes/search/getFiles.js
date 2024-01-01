const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

const { formatBytes, sortByName, sortByViews, sortBySize, sortByType } = require("../utils");

function isEmpty(obj) {
  for (const prop in obj) {
    if (Object.hasOwn(obj, prop)) {
      return false;
    }
  }

  return true;
}

function searchByName(list, filter) {
  return list.filter((row) => row.name.toUpperCase().indexOf(filter) > -1);
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
          viewCount: shareableLink !== undefined ? shareableLink.views : 0,
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

      res.json({
        files: filesWithSharedStatus.map((file) => ({ ...file, size: formatBytes(file.size) })),
        sort: isEmpty(queryParams) ? { sort: "name", dir: "asc" } : { sort: queryParams.sort, dir: queryParams.dir },
        search: queryParams.search ? queryParams.search : null,
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
