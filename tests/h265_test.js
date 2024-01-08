const ffmpeg = require("fluent-ffmpeg");
const inputfile = "video.mov";

// H.265 / HEVC (High Efficiency Video Coding) (encoders: libx265 hevc_videotoolbox)

// H.265 / HEVC (High Efficiency Video Coding) (encoders: libx265 nvenc_hevc hevc_nvenc hevc_qsv hevc_v4l2m2m hevc_vaapi )

const details = [
  "ultrafast",
  "superfast",
  "veryfast",
  "faster",
  "fast",
  "medium",
  "slow",
  "slower",
  "veryslow",
  "placebo",
];

async function main() {
  for (const detail of details) {
    const startTime = performance.now();
    console.log(`Started converting H265 - ${detail}`);

    try {
      await convertVideo(detail);

      const endTime = performance.now();

      console.log(
        `H265 - ${detail} conversion took ${endTime - startTime} milliseconds`
      );
    } catch (error) {
      console.error(error);
    }
  }
  console.log("Done H265 conversion.");
}

module.exports = main;

function convertVideo(detail) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputfile)
      .videoCodec("hevc_videotoolbox")
      .size(`?x1080`)
      .videoBitrate(5000)
      .outputOptions([`-preset ${detail}`])
      .on("error", function (err, stdout, stderr) {
        if (err) {
          console.log(err.message);
          console.log("stdout:\n" + stdout);
          console.log("stderr:\n" + stderr);
          reject("Error");
        }
      })
      .on("end", function () {
        resolve();
      })
      .output(`conversion/h265_${detail}.mp4`)
      .run();
  });
}
