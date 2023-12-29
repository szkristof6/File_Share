const fs = require("fs");
require("dotenv").config();

const ShareKey = require("../../models/ShareKey");

const { geenrateUniqueId } = require("../utils");

function modifyPlaylist(playlistId, shareId) {
  const playlist = `${process.env.STORAGE_LOCATION}/${playlistId}/video.m3u8`;
  const playlistFile = fs.readFileSync(playlist, "utf-8");

  const lines = playlistFile.split("\n");

  let modifiedPlaylist = "";

  lines.forEach((line) => {
    if(line){
      if (!line.startsWith("#")) {
        if (line.startsWith("segment")) {
          modifiedPlaylist += `${shareId}/${line.split(".")[0].split("_").pop()}\n`;
        } else {
          modifiedPlaylist += `${shareId}/${line.split("/").pop()}\n`;
        }
      } else {
        modifiedPlaylist += `${line}\n`;
      }
    }
  });

  fs.writeFileSync(playlist, modifiedPlaylist);
}

module.exports = async (req, res) => {
  try {
    const fileId = req.params.id;

    // Create a new ShareKey and associate it with the specified file
    const shareKey = new ShareKey({
      key: geenrateUniqueId(),
      file: fileId,
    });

    // Save the share key to MongoDB
    await shareKey.save();

    modifyPlaylist(fileId, shareKey.key);

    res.json({ shareableLink: shareKey.key });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      status: "error",
      message: "Error sharing file",
    });
  }
};
