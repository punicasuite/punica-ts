import * as fs from 'fs';
import * as git from 'isomorphic-git';

git.plugins.set('fs', fs);

import { Box } from '../src/box/box';
import { ensureRemoveDirIfExists } from '../src/utils/fileSystem';

describe('Box test', () => {
  test.skip('test git clone', async () => {
    const box = new Box();
    await box.gitClone('https://github.com/punica-box/punica-init-default-box', './test_box');
    ensureRemoveDirIfExists('./test_box');
  });

  test.skip('test git clone exists', async () => {
    fs.mkdirSync('./test_box');

    const box = new Box();
    await expect(
      box.gitClone('https://github.com/punica-box/punica-init-default-box', './test_box')
    ).rejects.toBeTruthy();

    ensureRemoveDirIfExists('./test_box');
  });

  test.skip('test git url not exist', async () => {
    const box = new Box();
    await expect(
      box.gitClone('https://github.com/punica-box/punica-init-default-boxa', './test_box')
    ).rejects.toBeTruthy();

    ensureRemoveDirIfExists('./test_box');
  });

  test('test git clone', async () => {
    const box = new Box();
    await box.init('./test_box');
    ensureRemoveDirIfExists('./test_box');
  });
});
