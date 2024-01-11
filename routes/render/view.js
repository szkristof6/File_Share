const File = require("../../models/File");

module.exports = async (req, res) => {
  const link = req.params.link;

  try {
    // Find the file associated with the ShareKey
    const file = await File.findOne({ link });

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    const updatedViews = (file.views += 1);

    await File.findOneAndUpdate({link}, { views: updatedViews });

    res.render("video", { link });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "File not found",
    });
  }
};
