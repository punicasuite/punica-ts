import * as fs from 'fs';
import * as path from 'path';

const root = path.resolve(__dirname, '..', '..');
const contents = fs.readFileSync(root + '/package.json');

let version: string;
if (contents) {
  const pjson = JSON.parse(contents.toString());
  version = pjson.version;
} else {
  version = 'undefined';
}

export { version };
