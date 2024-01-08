const { getStorageSpace } = require("../utils");

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
