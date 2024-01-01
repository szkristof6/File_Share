const fs = require("fs");
require("dotenv").config();

const ShareKey = require("../../models/ShareKey");

const { geenrateUniqueId, conversionList } = require("../utils");

function modifyPlaylist(playlistId, shareId) {
  conversionList.forEach(({height}) => {
    const playlist = `${process.env.STORAGE_LOCATION}/${playlistId}/${height}p.m3u8`;
    const playlistFile = fs.readFileSync(playlist, "utf-8");

    const lines = playlistFile.split("\n");

    let modifiedPlaylist = "";

    lines.forEach((line) => {
      if (line) {
        if (!line.startsWith("#")) {
          if (line.split("/").length === 1) {
            modifiedPlaylist += `${height}/${line.split(".")[0].split("_").pop()}\n`;
          } else {
            modifiedPlaylist += `${height}/${line.split("/").pop()}\n`;
          }
        } else {
          modifiedPlaylist += `${line}\n`;
        }
      }
    });

    fs.writeFileSync(playlist, modifiedPlaylist);
  });

  const masterPlaylist = `${process.env.STORAGE_LOCATION}/${playlistId}/master.m3u8`;
  const playlistFile = fs.readFileSync(masterPlaylist, "utf-8");

  const lines = playlistFile.split("\n");

  let modifiedPlaylist = "";

  lines.forEach((line) => {
    if (line) {
      if (!line.startsWith("#")) {
        if (line.split("/").length > 1) {
          modifiedPlaylist += `${shareId}/${line.split("/").pop()}\n`;
        } else {
          modifiedPlaylist += `${shareId}/${line}\n`;
        }
      } else {
        modifiedPlaylist += `${line}\n`;
      }
    }
  });

  fs.writeFileSync(masterPlaylist, modifiedPlaylist);
}

module.exports = async (req, res) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).send({ status: "error", message: "Not logged in!" });
    }

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
