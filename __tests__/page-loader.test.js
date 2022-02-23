import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import path from 'path';
import nock from 'nock';
import PageLoader from '../lib/page-loader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const getFixturePath = (filename) => path.join(__dirname, '..', '__fixtures__', filename);
const readFile = (filename) => fs.promises.readFile(filename, 'utf-8');

let tempdir;

beforeEach(async () => {
  tempdir = await fs.promises.mkdtemp(path.join(os.tmpdir(), 'page-loader-'));
  const data = await readFile(getFixturePath('expected.html'));
  nock('https://ru.hexlet.io')
    .get('/courses')
    .reply(200, data);
});

afterEach(async () => {
  await fs.promises.rm(tempdir, { recursive: true, force: true });
});

test('page loader', async () => {
  const expected = await readFile(getFixturePath('expected.html'));
  const pageLoader = new PageLoader('https://ru.hexlet.io/courses', tempdir);
  await pageLoader
    .getHtml()
    .then(async (response) => {
      await pageLoader.writeFile(response.data);
    });

  await expect(readFile(`${tempdir}/ru-hexlet-io-courses.html`)).resolves.toEqual(expected);
});
