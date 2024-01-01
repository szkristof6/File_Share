const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs");

require("dotenv").config();

const { conversionList } = require("../utils");

let conversionsCompleted = 0;

function createMasterPlaylist(outputDir, res) {
  const masterM3U8Content = `#EXTM3U
#EXT-X-VERSION:3
${conversionList.map((conversion) => `#EXT-X-STREAM-INF:BANDWIDTH=${conversion.bitrate},RESOLUTION=${conversion.width}x${conversion.height}\n${conversion.height}`).join("\n")}\n`;

  fs.writeFile(`${outputDir}/master.m3u8`, masterM3U8Content, (err) => {
    if (err) {
      console.error("Error writing master M3U8 file:", err);
      res.end(
        JSON.stringify({
          status: "error",
          message: "Error creating master playlist",
        })
      );
    } else {
      console.log("Master M3U8 file created successfully");
      res.end(
        JSON.stringify({
          status: "success",
        })
      );
    }
  });
}

function convertVideo(conversion, outputDir, res) {
  fs.mkdirSync(`${outputDir}/${conversion.height}p_segments`);

  ffmpeg(`${outputDir}/original`)
    .size(`${conversion.width}x${conversion.height}`)
    .videoBitrate(conversion.bitrate)
    .outputOptions([
      "-preset faster",
      "-x264opts opencl",
      "-hls_time 2",
      "-hls_playlist_type vod",
      `-hls_segment_filename ${outputDir}/${conversion.height}p_segments/${conversion.height}_segment_%03d.ts`,
    ])
    .on("error", function (error) {
      console.log(error);
      res.write(
        JSON.stringify({
          format: `${conversion.height}p`,
          status: "error",
        })
      );
    })
    .on("end", function () {
      conversionsCompleted++;

      if (conversionsCompleted === conversionList.length) {
        createMasterPlaylist(outputDir, res);
      }
      res.write(
        JSON.stringify({
          format: `${conversion.height}p`,
          status: "finish",
        })
      );
    })
    .on("progress", function (progress) {
      res.write(
        JSON.stringify({
          format: `${conversion.height}p`,
          status: progress.percent,
        })
      );
    })
    .output(`${outputDir}/${conversion.height}p.m3u8`)
    .run();
}

module.exports = async (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send({ status: "error", message: "Not logged in!" });
  }

  const fileId = req.params.id;
  const outputDir = `${process.env.STORAGE_LOCATION}/${fileId}`; // Folder for upload

  conversionList.forEach((conversion) => {
    convertVideo(conversion, outputDir, res);
  });
};
