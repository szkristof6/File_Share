const File = require("../../models/File");

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

      let finalFiles = files.map((file) => {
        const fileObject = file.toObject();

        return {
          _id: fileObject._id,
          name: fileObject.name,
          size: fileObject.size,
          converted: fileObject.converted,
          views: fileObject.views,
        };
      });

      const queryParams = req.query;

      if (queryParams) {
        if (queryParams.sort === "name") {
          sortByName(finalFiles, queryParams.dir);
        } else if (queryParams.sort === "size") {
          sortBySize(finalFiles, queryParams.dir);
        } else if (queryParams.sort === "type") {
          sortByType(finalFiles, queryParams.dir);
        } else if (queryParams.sort === "views") {
          sortByViews(finalFiles, queryParams.dir);
        } else {
          sortByName(finalFiles);
        }

        if (queryParams.search) {
          finalFiles = searchByName(finalFiles, queryParams.search);
        }
      }

      res.json({
        files: finalFiles.map((file) => ({
          ...file,
          size: formatBytes(file.size),
        })),
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
