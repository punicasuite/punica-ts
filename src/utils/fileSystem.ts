import * as fs from 'fs';
import * as path from 'path';
import { avmFileEmpty, directoryError, otherError } from '../exception/punicaException';

export function removeFileIfExists(p: fs.PathLike) {
  if (fs.statSync(p).isFile()) {
    fs.unlinkSync(p);
  }
}

export function ensureRemoveDirIfExists(p: fs.PathLike) {
  if (fs.existsSync(p)) {
    fs.readdirSync(p).forEach((file, index) => {
      const curPath = p + '/' + file;
      if (fs.lstatSync(curPath).isDirectory()) {
        // recurse
        ensureRemoveDirIfExists(curPath);
      } else {
        // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(p);
  }
}

export function ensureDirExist(p: fs.PathLike) {
  if (fs.existsSync(p)) {
    if (fs.statSync(p).isFile()) {
      throw new Error(`Path ${path} is a file. Should be a directory.`);
    }
  } else {
    fs.mkdirSync(p, { recursive: true });
  }
}

export function readAvm(avmDirPath: string, avmFileName?: string): [Buffer, string] {
  if (!fs.statSync(avmDirPath).isDirectory) {
    throw directoryError();
  }

  let avm: Buffer;
  if (avmFileName !== undefined) {
    const avmFilePath = path.join(avmDirPath, avmFileName);

    if (!fs.existsSync(avmFilePath)) {
      throw otherError(`${avmFilePath} not exist`);
    }

    avm = readAvmInternal(avmFilePath);
    return [avm, avmFileName];
  } else {
    const dirList = fs.readdirSync(avmDirPath);
    avm = new Buffer('');

    for (const file of dirList) {
      const splitPath = path.parse(file);

      if ((pathRoot(splitPath) === avmFileName || avmFileName === undefined) && splitPath.ext === '.avm') {
        avmFileName = file;
        const avmPath = path.join(avmDirPath, file);

        avm = readAvmInternal(avmPath);
        return [avm, avmFileName];
      }
    }

    throw avmFileEmpty();
  }
}

function readAvmInternal(p: string) {
  const codeBuffer = fs.readFileSync(p);
  const codeString = codeBuffer.toString();
  return new Buffer(codeString, 'hex');
}

function pathRoot(splitPath: path.ParsedPath) {
  return path.join(splitPath.dir, splitPath.name);
}
