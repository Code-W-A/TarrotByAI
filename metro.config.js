const { getDefaultConfig } = require("@expo/metro-config");
const defaultSourceExts =
  require("metro-config/src/defaults/defaults").sourceExts;

// Extensiile de fișiere suplimentare
const additionalExts = ["jsx", "js", "ts", "tsx", "json", "d.ts", "mjs"];

// Obține configurația implicită
const defaultConfig = getDefaultConfig(__dirname);

// Combinați extensiile de fișiere, eliminând 'svg' din assetExts și adăugându-l la sourceExts
defaultConfig.resolver.sourceExts = additionalExts.concat(
  defaultSourceExts,
  "svg"
); // Adaugă 'svg' aici
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
); // Exclude 'svg' din asset-uri

// Adăugați orice alte extensii de asset-uri necesare, precum 'cjs'
defaultConfig.resolver.assetExts.push("cjs");

// Specifică transformer-ul pentru 'svg'
defaultConfig.transformer = {
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

module.exports = defaultConfig;
