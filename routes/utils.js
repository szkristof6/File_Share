const checkDiskSpace = require("check-disk-space").default;
const { v4: uuidv4 } = require("uuid");

require("dotenv").config();

const geenrateUniqueId = () => `${uuidv4()}-${Date.now()}`;

const conversionList = [
  {
    width: 256,
    height: 144,
    bitrate: 300,
    preset: "faster",
  },
  {
    width: 426,
    height: 240,
    bitrate: 700,
    preset: "faster",
  },
  /* 
  {
    width: 640,
    height: 360,
    bitrate: 1000,
    preset: "faster",
  },
  {
    width: 854,
    height: 480,
    bitrate: 2000,
    preset: "faster",
  },
  {
    width: 1280,
    height: 720,
    bitrate: 4000,
    preset: "medium",
  },
  {
    width: 1920,
    height: 1080,
    bitrate: 8000,
    preset: "slow",
  },
  {
    width: 2560,
    height: 1440,
    bitrate: 10000,
    preset: "slow",
  },
  {
    width: 3840,
    height: 2160,
    bitrate: 12000,
    preset: "slower",
  },
  */
];

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return "0 Bytes";
  const k = 1000;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}

async function getStorageSpace() {
  const diskSpace = await checkDiskSpace(process.env.STORAGE_LOCATION);

  return {
    free: formatBytes(diskSpace.free),
    size: formatBytes(diskSpace.size),
  };
}

function sortByName(list, dir = "asc") {
  const direction = dir === "asc";

  list.sort(function (a, b) {
    const nameA = a.name.toUpperCase(); // ignore upper and lowercase
    const nameB = b.name.toUpperCase(); // ignore upper and lowercase
    if (nameA > nameB) {
      return direction ? 1 : -1;
    }
    if (nameA < nameB) {
      return direction ? -1 : 1;
    }

    // names must be equal
    return 0;
  });
}

function sortBySize(list, dir) {
  const direction = dir === "asc";

  list.sort((a, b) => {
    return direction ? b.size - a.size : a.size - b.size;
  });
}

function sortByType(list, dir) {
  const direction = dir === "asc";

  list.sort(function (a, b) {
    const typeA = a.type.toUpperCase(); // ignore upper and lowercase
    const typeB = b.type.toUpperCase(); // ignore upper and lowercase
    if (typeA > typeB) {
      return direction ? 1 : -1;
    }
    if (typeA < typeB) {
      return direction ? -1 : 1;
    }

    // names must be equal
    return 0;
  });
}

function sortByViews(list, dir) {
  const direction = dir === "asc";

  list.sort((a, b) => {
    return direction ? b.viewCount - a.viewCount : a.viewCount - b.viewCount;
  });
}

module.exports = {
  conversionList,
  geenrateUniqueId,
  formatBytes,
  getStorageSpace,
  sortByName,
  sortByViews,
  sortBySize,
  sortByType,
};
