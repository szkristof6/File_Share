const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

require("dotenv").config();

const File = require("../../models/File");
const { conversionList } = require("../utils");

function getVideoData(file) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(file, (error, metadata) => {
      if (error) {
        console.error("Error while probing:", error);
        reject(error);
      }

      resolve({
        fileResolution: metadata.streams[0].coded_width ? metadata.streams[0].height : metadata.streams[1].height,
        fileBitrate: metadata.format.bit_rate,
      });
    });
  });
}

function createMasterPlaylist(fileId, outputDir) {
  return new Promise((resolve, reject) => {
    const masterPlaylist = `#EXTM3U
  #EXT-X-VERSION:3
  ${conversionList
    .map(
      (conversion) =>
        `#EXT-X-STREAM-INF:BANDWIDTH=${conversion.bitrate * 1000},RESOLUTION=${conversion.width}x${conversion.height}\n${fileId}/${conversion.height}`
    )
    .join("\n")}\n`;

    try {
      fs.writeFileSync(`${outputDir}/master.m3u8`, masterPlaylist);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function modifyResolutionPlaylist(height, outputDir) {
  return new Promise((resolve, reject) => {
    const playlist = `${outputDir}/${height}p.m3u8`;
    const playlistFile = fs.readFileSync(playlist, "utf-8");

    const lines = playlistFile.split("\n");

    let modifiedPlaylist = "";

    lines.forEach((line) => {
      if (line) {
        if (!line.startsWith("#")) {
          modifiedPlaylist += `${height}/${line.split(".")[0].split("_").pop()}\n`;
        } else {
          modifiedPlaylist += `${line}\n`;
        }
      }
    });

    try {
      fs.writeFileSync(playlist, modifiedPlaylist);
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

function convertVideo(conversion, outputDir) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(`${outputDir}/${conversion.height}p_segments`);

    ffmpeg(`${outputDir}/original`)
      .size(`${conversion.width}x${conversion.height}`)
      .videoBitrate(conversion.bitrate)
      .outputOptions([
        `-preset ${conversion.preset}`,
        "-x264opts opencl",
        "-hls_time 2",
        "-hls_playlist_type vod",
        "-movflags +faststart",
        `-hls_segment_filename ${outputDir}/${conversion.height}p_segments/${conversion.height}_segment_%03d.ts`,
      ])
      .on("error", function (error) {
        reject(error);
      })
      .on("end", function () {
        resolve();
      })
      .output(`${outputDir}/${conversion.height}p.m3u8`)
      .run();
  });
}

module.exports = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ status: "error", message: "Not logged in!" });
  }

  const fileId = req.params.id;
  const outputDir = `${process.env.STORAGE_LOCATION}/${fileId}`; // Folder for upload

  if (!File.findById(fileId)) {
    return res.status(404).send({ status: "error", message: "File not found" });
  }

  const { fileResolution } = await getVideoData(`${outputDir}/original`);

  try {
    for (const conversion of conversionList) {
      if(conversion.height <= fileResolution){
        await convertVideo(conversion, outputDir);
        await modifyResolutionPlaylist(conversion.height, outputDir);
      }
    }

    await File.findByIdAndUpdate(fileId, { converted: true });

    await createMasterPlaylist(fileId, outputDir);

    res.json({
      status: "success",
    });
  } catch (error) {
    console.log(error);
    res.json({
      status: "error",
      message: error.message,
    });
  }
};
