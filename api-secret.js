const path = require('path');
const fs = require('fs');

const envBuildFile = fs.readFileSync(path.normalize('./env.build.json'));
const envBuildData = JSON.parse(envBuildFile);

const APIPath = path.normalize(envBuildData.API_PATH);
const APIEnvFile = fs.readFileSync(path.join(APIPath, '.env'));
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
const envAppFile = fs.readFileSync(envAppFilePath);
let envAppData = JSON.parse(envAppFile);

envAppData.API_KEY = key;
envAppData = JSON.stringify(envAppData, null, 2);

fs.writeFileSync(envAppFilePath, envAppData, 'utf8');

console.log('--> Secret successfully retrieved from API');
