const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Disable experimental package exports to fix Windows slash resolution warnings for reselect, redux-thunk, axios
config.resolver.unstable_enablePackageExports = false;

if (!config.resolver.sourceExts.includes("mjs")) {
  config.resolver.sourceExts.push("mjs");
}

if (!config.resolver.sourceExts.includes("cjs")) {
  config.resolver.sourceExts.push("cjs");
}

module.exports = config;
