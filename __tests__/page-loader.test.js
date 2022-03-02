import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import pageLoader from '../lib/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.promises.readFile(filename, 'utf-8');

let tempdir;

beforeAll(async () => {
  tempdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
});

afterAll(async () => {
  await fs.promises.rm(tempdir, { recursive: true, force: true });
});

test('page loader', async () => {
  const actual = await readFile(getFixturePath('actual.html'));
  const expected = await readFile(getFixturePath('expected.html'));
  const png = await fs.promises.readFile(getFixturePath('nodejs.png'));
  const pngpath = `${tempdir}/ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png`;

  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, actual);
  nock('https://ru.hexlet.io')
    .get('/assets/professions/nodejs.png')
    .reply(200, png);

  await pageLoader('https://ru.hexlet.io/courses', tempdir)
    .then(async (filepath) => {
      await expect(readFile(filepath))
        .resolves
        .toEqual(expected);
    });

  await expect(fs.promises.readFile(pngpath))
    .resolves
    .toEqual(png);
});
