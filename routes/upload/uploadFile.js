const fs = require("fs");
const { exec } = require("child_process");

require("dotenv").config();

const File = require("../../models/File");

const { geenrateUniqueId } = require("../utils");

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
      
      // FFmpeg command for HLS conversion
      const ffmpegCommand = `ffmpeg -i ${outputDir}/original -c:v copy -c:a copy -hls_time 10 -hls_list_size 0 -hls_segment_filename ${outputDir}/segments/segment_%03d.ts ${outputDir}/video.m3u8`;
  
      exec(ffmpegCommand, (error, stdout, stderr) => {
        if (error) {
          console.error("Error converting video:", error);
          return res.status(500).json({ error: "Error converting video." });
        }
  
        res.status(200).json({ message: `Success` });
      });
    });

  }
};
