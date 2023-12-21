module.exports = (req, res) => {
  const shareableLink = req.params.shareableLink;

  res.render("view", { shareableLink }); // Redirect to login if user is not authenticated
};
