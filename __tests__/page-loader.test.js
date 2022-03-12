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
      .then(([filepath, tasks]) => {
        const expected = path.join(tempdir, files.actual.loadPath);
        expect(filepath).toEqual(expected);
        return Promise.all(tasks.map(([, e]) => e));
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

describe('negative cases', () => {
  let tempdir;

  beforeAll(async () => {
    tempdir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
    await fs.mkdir(path.join(tempdir, 'ru-hexlet-io_files'));
    await fs.mkdir(path.join(tempdir, 'no'), 0o555);
  });

  test.each([
    ['Client error', 404],
    ['Server error', 503],
  ])('%s %d', async (errMessage, status) => {
    const url = 'https://ru.hexlet.io';
    nock(url).get('/').reply(status);

    await expect(pageLoader(url, '/'))
      .rejects
      .toThrowError(`${errMessage} ${status} null (GET ${url})`);
  });

  test.each([
    ['EEXIST', '', 'Directory for resources already exists!'],
    ['ENOENT', 'path/to/dir', 'Target directory doesn\'t exist!'],
    ['EACCES', 'no', 'Permission denied!'],
  ])('file system error: %s', async (_n, dirname, errMessage) => {
    const url = 'https://ru.hexlet.io';
    const dirpath = path.join(tempdir, dirname);
    nock(url).get('/').reply(200, '<html><link href="/nodejs.html"></html>');
    nock(url).get('/nodejs.html').reply(200, '');

    await expect(pageLoader(url, dirpath))
      .rejects
      .toThrowError(errMessage);
  });

  afterAll(() => fs.rm(tempdir, { recursive: true, force: true }));
});
