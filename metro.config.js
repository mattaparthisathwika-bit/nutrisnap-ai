const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

// Set cache dir to D: to avoid C: disk full issues
process.env.NODE_TEMP_DIR = "D:\\node-temp";
process.env.METRO_CACHE_DIR = "D:\\metro-cache";

const config = getDefaultConfig(__dirname);

// Force disable Metro cache or redirect it
config.maxWorkers = 4; // Limit workers to reduce memory/disk usage

module.exports = config;
