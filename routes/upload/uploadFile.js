const fs = require("fs");
const ffmpeg = require("fluent-ffmpeg");

require("dotenv").config();

const File = require("../../models/File");

module.exports = async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ status: "error", message: "No files were uploaded!" });
  }

  const uploadedFiles = [req.files.uploadedFile];

  for (let fileKey in uploadedFiles) {
    const uploadedFile = uploadedFiles[fileKey];

    if (!uploadedFile.name.match(/\.(mp4|mov|avi)$/)) {
      return res.status(400).json({ error: "Please upload a valid video file." });
    }

    // Create a new File object with uploaded file information
    const file = new File({
      name: uploadedFile.name,
      size: uploadedFile.size,
      owner: req.user._json.email,
    });

    // Save the file information to MongoDB
    const savedFile = await file.save();

    const outputDir = `${process.env.STORAGE_LOCATION}/${savedFile._id}`; // Folder for upload

    // Create directory for HLS segments
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });

      fs.mkdirSync(`${outputDir}/segments`, { recursive: true });
    }

    // Use the mv() method to place the file somewhere on your server
    uploadedFile.mv(`${outputDir}/original`, function (err) {
      if (err) return res.status(500).send(err);

      ffmpeg(`${outputDir}/original`)
        .outputOptions(["-c:v copy", "-c:a copy", "-hls_time 2", "-hls_playlist_type vod", `-hls_segment_filename ${outputDir}/segments/segment_%03d.ts`])
        .on("error", function (error) {
          console.error("Error converting video:", error);
          return res.status(500).json({ error: "Error converting video." });
        })
        .on("end", function () {
          return res.status(200).json({ message: `Success` });
        })
        .on("progress", function (progress) {
          console.log("Processing: " + progress.percent + "% done");
        })
        .output(`${outputDir}/video.m3u8`)
        .run();
    });
  }
};
