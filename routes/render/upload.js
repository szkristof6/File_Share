const { getStorageSpace } = require("../utils");
const { conversionList } = require("../utils");

module.exports = async (req, res) => {
  if (req.isAuthenticated()) {
    res.render("upload", {
      user: req.user._json,
      diskSpace: await getStorageSpace(),
      resolutions: conversionList.map(conversion => `${conversion.height}p`),
    }); // Redirect to login if user is not authenticated
  } else {
    res.redirect("/auth/google"); // Redirect to login if user is not authenticated
  }
};
