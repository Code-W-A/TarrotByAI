const fs = require('fs');
const path = require('path');

const appJsonPath = path.join(__dirname, '..', 'app.json');
const dryRun = process.argv.includes('--dry-run');

function bumpVersion(version) {
  const parts = version.split('.');

  if (parts.length === 0 || parts.length > 3 || parts.some(part => !/^\d+$/.test(part))) {
    throw new Error(
      `Unsupported expo.version "${version}". Expected up to three numeric parts, for example 2.2.0.`
    );
  }

  const nextParts = [...parts];
  const lastIndex = nextParts.length - 1;
  nextParts[lastIndex] = String(Number(nextParts[lastIndex]) + 1);

  return nextParts.join('.');
}

if (!fs.existsSync(appJsonPath)) {
  console.error('[bump-expo-version] app.json not found.');
  process.exit(1);
}

let appJson;
try {
  appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));
} catch (error) {
  console.error(`[bump-expo-version] Failed to read app.json: ${error.message || error}`);
  process.exit(1);
}

if (!appJson.expo || typeof appJson.expo.version !== 'string') {
  console.error('[bump-expo-version] expo.version is missing from app.json.');
  process.exit(1);
}

const currentVersion = appJson.expo.version;
let nextVersion;

try {
  nextVersion = bumpVersion(currentVersion);
} catch (error) {
  console.error(`[bump-expo-version] ${error.message || error}`);
  process.exit(1);
}

console.log(`[bump-expo-version] ${currentVersion} -> ${nextVersion}`);

if (dryRun) {
  process.exit(0);
}

appJson.expo.version = nextVersion;

try {
  fs.writeFileSync(appJsonPath, `${JSON.stringify(appJson, null, 2)}\n`, 'utf8');
} catch (error) {
  console.error(`[bump-expo-version] Failed to write app.json: ${error.message || error}`);
  process.exit(1);
}

