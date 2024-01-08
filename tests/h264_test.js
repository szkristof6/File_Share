const ffmpeg = require("fluent-ffmpeg");
const inputfile = "video.mov";

// H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10 (encoders: libx264 libx264rgb h264_videotoolbox)

// H.264 / AVC / MPEG-4 AVC / MPEG-4 part 10 (encoders: libx264 libx264rgb h264_nvenc h264_omx h264_qsv h264_v4l2m2m h264_vaapi nvenc nvenc_h264 )

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
    console.log(`Started converting ${detail}`);

    try {
      convertVideo(detail).then(() => {
        const endTime = performance.now();
  
        console.log(
          `H264 - ${detail} conversion took ${endTime - startTime} milliseconds`
        );
      });

    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = main;

function convertVideo(detail) {
  return new Promise((resolve, reject) => {
    ffmpeg(inputfile)
      .videoCodec("h264_videotoolbox")
      .size(`?x1080`)
      .videoBitrate(5000)
      .outputOptions([`-preset ${detail}`, "-x264opts opencl"])
      .on('error', function(err, stdout, stderr) {
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
      .output(`conversion/h264_opencl_${detail}.mp4`)
      .run();
  });
}
