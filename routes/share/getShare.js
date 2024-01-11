const File = require("../../models/File");
const { conversionList, getVideoData } = require("../utils");

module.exports = async (req, res) => {
  try {
    const { link } = req.params;

    const file = await File.findOne({ link });

    if (!file) {
      return res.status(404).json({
        status: "error",
        message: "File not found",
      });
    }

    if (file.name.endsWith(".mp4")) {
      const outputDir = `${process.env.STORAGE_LOCATION}/${file._id.toString()}`;

      const { fileResolution } = await getVideoData(`${outputDir}/original`);

      const masterPlaylist = `#EXTM3U
#EXT-X-VERSION:3
${conversionList
        .filter((x) => x.height <= fileResolution)
        .map(
          (conversion) =>
            `#EXT-X-STREAM-INF:BANDWIDTH=${conversion.bitrate * 1000},RESOLUTION=${conversion.width}x${conversion.height}\n${file.link}/${
              conversion.height
            }`
        )
        .join("\n")}`;

      return res.send(masterPlaylist);
    } else {
      return res.json({
        status: "error",
        message: "Not supported file",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: "error",
      message: "Error viewing file",
    });
  }
};
