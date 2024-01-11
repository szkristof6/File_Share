const ffmpeg = require("fluent-ffmpeg");
const { exec } = require("child_process");
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

function createManifestFile(fileResolution, outputDir) {
  const inputFiles = conversionList
    .filter((x) => x.height <= fileResolution)
    .map((x) => `${outputDir}/${x.height}p.mp4`)
    .join(" ");

  const command = `MP4Box -dash 2000 -rap -frag-rap -profile dashavc264:live -out ${outputDir}/manifest.mpd ${inputFiles}`;

  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error generating DASH manifest: ${stderr}`);
        reject(error);
      } else {
        console.log(`DASH manifest generated successfully: ${outputDir}`);
        resolve();
      }
    });
  });
}

function convertVideo(conversion, outputDir) {
  return new Promise((resolve, reject) => {
    ffmpeg(`${outputDir}/original`)
      .size(`${conversion.width}x${conversion.height}`)
      .videoBitrate(conversion.bitrate)
      .outputOptions([`-preset ${conversion.preset}`, "-x264opts opencl"])
      .on("error", function (error) {
        reject(error);
      })
      .on("end", function () {
        resolve();
      })
      .output(`${outputDir}/${conversion.height}p.mp4`)
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
      if (conversion.height <= fileResolution) {
        await convertVideo(conversion, outputDir);
      }
    }

    await createManifestFile(fileResolution, outputDir);

    await File.findByIdAndUpdate(fileId, { converted: true });

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
