const { getDefaultConfig } = require("@expo/metro-config");
const defaultSourceExts =
  require("metro-config/src/defaults/defaults").sourceExts;

// Extensiile de fișiere suplimentare
const additionalExts = ["jsx", "js", "ts", "tsx", "json", "svg", "d.ts", "mjs"];

// Obține configurația implicită
const defaultConfig = getDefaultConfig(__dirname);

// Combinați extensiile de fișiere
defaultConfig.resolver.sourceExts = additionalExts.concat(defaultSourceExts);

// Adăugați orice alte extensii de asset-uri necesare
defaultConfig.resolver.assetExts.push("cjs");

module.exports = defaultConfig;
