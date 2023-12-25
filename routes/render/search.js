const File = require("../../models/File");
const ShareKey = require("../../models/ShareKey");

const { formatBytes, getStorageSpace, sortByName, sortByViews, sortBySize, sortByType } = require("../utils");

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
      res.render("search", {
        user: req.user._json,
        diskSpace: await getStorageSpace(),
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        message: "Error fetching files",
      });
    }
  } else {
    return res.redirect("/auth/google"); // Redirect to login if user is not authenticated
  }
};
