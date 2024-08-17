const { getDefaultConfig } = require("@expo/metro-config");

// Get the default file extensions from metro-config
const defaultSourceExts =
  require("metro-config/src/defaults/defaults").sourceExts;

// Define any additional file extensions
const additionalExts = ["jsx", "js", "ts", "tsx", "json", "d.ts", "mjs"];

// Obtain the default configuration
const defaultConfig = getDefaultConfig(__dirname);

// Modify the sourceExts to include 'svg'
defaultConfig.resolver.sourceExts = [
  ...defaultSourceExts,
  ...additionalExts,
  "svg",
];

// Filter out 'svg' from assetExts as it will be handled by the transformer
defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);

// Add any other necessary asset extensions, such as 'cjs'
defaultConfig.resolver.assetExts.push("cjs");

// Specify the transformer for 'svg' files
defaultConfig.transformer = {
  babelTransformerPath: require.resolve("react-native-svg-transformer"),
};

module.exports = defaultConfig;
