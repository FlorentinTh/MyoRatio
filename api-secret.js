const path = require('node:path');
const { readFileSync, writeFileSync } = require('node:fs');

let envBuildFile;
try {
  envBuildFile = readFileSync(path.normalize('./env.build.json'), { encoding: 'utf8' });
} catch (error) {
  console.error(error);
  process.exit(-1);
}

const envBuildData = JSON.parse(envBuildFile);
const APIPath = path.normalize(envBuildData.API_PATH);

let APIEnvFile;
try {
  APIEnvFile = readFileSync(path.join(APIPath, '.env'), { encoding: 'utf8' });
} catch (error) {
  console.error(error);
  process.exit(-1);
}

const APIEnvData = APIEnvFile.toString();
const lines = APIEnvData.split(/\r\n|\r|\n/g);

let APIKeyLine = null;
for (const line of lines) {
  if (line.includes('API_KEY = ')) {
    APIKeyLine = line;
    break;
  }
}

let key = null;
if (!(APIKeyLine === null)) {
  const regexp = /(?<=")[^"]*(?=")/;
  key = APIKeyLine.match(regexp)[0];
}

const envAppFilePath = path.normalize('./env.app.json');

let envAppFile;
try {
  envAppFile = readFileSync(envAppFilePath, { encoding: 'utf8' });
} catch (error) {
  console.error(error);
  process.exit(-1);
}

let envAppData = JSON.parse(envAppFile);

envAppData.API_KEY = key;
envAppData = JSON.stringify(envAppData, null, 2);

try {
  writeFileSync(envAppFilePath, envAppData, { encoding: 'utf8' });
} catch (error) {
  console.error(error);
  process.exit(-1);
}

console.log('--> Secret successfully retrieved from API');
