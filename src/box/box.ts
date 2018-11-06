import * as fs from 'fs';
import * as git from 'isomorphic-git';
import * as path from 'path';
import { fileExistError, invalidBoxName, networkError, PunicaException } from '../exception/punicaException';
import { ensureRemoveDirIfExists, removeFileIfExists } from '../utils/fileSystem';

// tslint:disable:no-console

export class Box {
  async init(initToPath: string) {
    const repoUrl = 'https://github.com/punica-box/punica-init-default-box.git';
    await this.gitClone(repoUrl, initToPath);
    this.handleIgnorance(initToPath);

    console.log('Unbox successful. Enjoy it!');
  }

  async handleIgnorance(repoToPath: string = '') {
    console.log('Unpacking...');

    const boxIgnoreFilePath = path.join(repoToPath, 'punica-box.json');
    let boxIgnoreFiles: string[] | undefined;

    if (!fs.existsSync(boxIgnoreFilePath)) {
      return;
    }

    try {
      const f = fs.readFileSync(boxIgnoreFilePath);
      const json = JSON.parse(f.toString());

      boxIgnoreFiles = json.ignore;

      removeFileIfExists(boxIgnoreFilePath);

      if (boxIgnoreFiles !== undefined) {
        for (const file of boxIgnoreFiles) {
          const filePath = path.join(repoToPath, file);

          try {
            ensureRemoveDirIfExists(filePath);
            removeFileIfExists(filePath);
          } catch (_2) {
            console.warn(`Cant delete ${filePath}.`);
          }
        }
      }
    } catch (_) {
      console.warn(`Cant process ${repoToPath}.`);
      throw _;
    }
  }

  async gitClone(repoUrl: string, repoToPath: string = '') {
    console.log('Downloading...');

    if (fs.existsSync(repoToPath)) {
      if (fs.statSync(repoToPath).isDirectory()) {
        if (fs.readdirSync(repoToPath).length > 0) {
          throw fileExistError();
        }
      } else {
        throw fileExistError();
      }
    }

    try {
      await git.clone({ url: repoUrl, dir: repoToPath });
    } catch (e) {
      throw networkError();
    }
  }

  generateRepoUrl(boxName: string) {
    const re1 = /^([a-zA-Z0-9-])+$/;
    const re2 = /^([a-zA-Z0-9-])+\/([a-zA-Z0-9-])+$/;

    if (re1.test(boxName)) {
      return `https://github.com/punica-box/${boxName}-box.git`;
    } else if (!re2.test(boxName)) {
      return `https://github.com/${boxName}.git`;
    } else {
      throw invalidBoxName();
    }
  }

  async unbox(boxName: string, repoToPath: string = '') {
    const repoUrl = this.generateRepoUrl(boxName);

    try {
      await this.gitClone(repoUrl, repoToPath);
    } catch (e) {
      if (e instanceof PunicaException) {
        if (e.code === 59000) {
          console.log('Please check out your box name.');
          return;
        }
      }

      throw e;
    }

    try {
      await this.handleIgnorance(repoToPath);
    } catch (e) {
      console.log('Clean work abort...');
      return;
    }
    console.log('Unbox successful. Enjoy it!');
  }
}
