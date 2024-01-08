const h264 = require("./h264_test");
const h265 = require("./h265_test");

async function main() {
  await h265();
  await h264();
}

main().then(() => console.log("Done"));
