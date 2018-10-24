import * as fs from 'fs';

export function removeFileIfExists(path: fs.PathLike) {
  if (fs.statSync(path).isFile()) {
    fs.unlinkSync(path);
  }
}

export function ensureRemoveDirIfExists(path: fs.PathLike) {
  if (fs.existsSync(path)) {
    fs.readdirSync(path).forEach((file, index) => {
      const curPath = path + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        ensureRemoveDirIfExists(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
}
