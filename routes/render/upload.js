const { getStorageSpace } = require("./utils");

module.exports = async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("upload", {
      user: req.user._json,
      diskSpace: await getStorageSpace()
    }); // Redirect to login if user is not authenticated
  } else {
    res.redirect("/auth/google"); // Redirect to login if user is not authenticated
  }
};
