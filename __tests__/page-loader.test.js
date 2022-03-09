import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filepath) => fs.readFile(filepath);

describe('positive case', () => {
  let tempdir;
  const files = {
    actual: {
      fixturePath: 'actual.html',
      loadPath: 'ru-hexlet-io-courses.html',
      url: '/courses',
    },
    png: {
      fixturePath: 'nodejs.png',
      loadPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png',
      url: '/assets/professions/nodejs.png',
    },
    html: {
      fixturePath: 'actual.html',
      loadPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-courses.html',
      url: '/courses',
    },
    css: {
      fixturePath: 'application.css',
      loadPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css',
      url: '/assets/application.css',
    },
    js: {
      fixturePath: 'runtime.js',
      loadPath: 'ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js',
      url: '/packs/js/runtime.js',
    },
  };

  beforeAll(async () => {
    tempdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));

    const promises = Object.keys(files).map((file) => {
      const { fixturePath, url } = files[file];
      return readFile(getFixturePath(fixturePath))
        .then((data) => {
          nock('https://ru.hexlet.io').get(url).reply(200, data);
        });
    });

    return Promise.all(promises);
  });

  test('page loader return downloaded html filepath', async () => {
    await pageLoader('https://ru.hexlet.io/courses', tempdir)
      .then((filepath) => {
        const expected = path.join(tempdir, files.actual.loadPath);
        expect(filepath).toEqual(expected);
      });
  });

  test('main page downloaded', async () => {
    const actual = await readFile(path.join(tempdir, files.actual.loadPath));
    const expected = await readFile(getFixturePath('expected.html'));

    expect(actual).toEqual(expected);
  });

  test.each(
    Object.keys(files).filter((e) => e !== 'actual').map((e) => [e]),
  )('%s downloaded', async (file) => {
    const { fixturePath, loadPath } = files[file];
    const filepath = path.join(tempdir, loadPath);
    const expected = await fs.readFile(getFixturePath(fixturePath));
    await expect(readFile(filepath))
      .resolves
      .toEqual(expected);
  });

  afterAll(() => fs.rm(tempdir, { recursive: true, force: true }));
});
