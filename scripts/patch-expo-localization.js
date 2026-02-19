const fs = require('fs');
const path = require('path');

const filePath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo-localization',
  'ios',
  'LocalizationModule.swift'
);

if (!fs.existsSync(filePath)) {
  console.log('[patch-expo-localization] Skipped: file not found.');
  process.exit(0);
}

let source;
try {
  source = fs.readFileSync(filePath, 'utf8');
} catch (error) {
  console.error(
    `[patch-expo-localization] Failed to read file: ${error.message || error}`
  );
  process.exit(1);
}

if (source.includes('@unknown default:')) {
  console.log('[patch-expo-localization] Already applied.');
  process.exit(0);
}

const needle = `    case .iso8601:
      return "iso8601"
    }
`;

const replacement = `    case .iso8601:
      return "iso8601"
    @unknown default:
      return "gregory"
    }
`;

if (!source.includes(needle)) {
  console.error('[patch-expo-localization] Failed: expected block not found.');
  process.exit(1);
}

const patched = source.replace(needle, replacement);

try {
  fs.writeFileSync(filePath, patched, 'utf8');
  console.log('[patch-expo-localization] Patch applied successfully.');
} catch (error) {
  console.error(
    `[patch-expo-localization] Failed to write file: ${error.message || error}`
  );
  process.exit(1);
}
