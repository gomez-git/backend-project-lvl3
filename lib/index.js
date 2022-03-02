import fs from 'fs';
import path from 'path';
import axios from 'axios';
import cheerio from 'cheerio';
import prettier from 'prettier';
import PageLoader from './Page-Loader.js';

export default (url, dir, pageLoader = new PageLoader(url, dir)) => axios(url)
  .then((response) => {
    const dirpath = pageLoader.getDirpath();
    const dirname = pageLoader.getDirname();
    pageLoader.setHtml(response.data);
    fs.promises.mkdir(dirpath);

    const $ = cheerio.load(response.data);
    $('img').each((i, elem) => {
      const { origin } = pageLoader.getUrl();
      const newURL = new URL($(elem).attr('src'), origin);

      if (newURL.origin === origin) {
        const file = path.parse(newURL.pathname);
        const filename = `${pageLoader.getUrl().host.replaceAll('.', '-')}${file.dir.replaceAll('/', '-')}-${file.base.replaceAll('_', '-')}`;
        const filepath = path.join(dirpath, filename);

        axios(newURL.href, { responseType: 'arraybuffer' })
          .then(({ data }) => {
            fs.promises.writeFile(filepath, data);
          });
        $(elem).attr('src', `${dirname}/${filename}`);
      }
    });
    pageLoader.setChangedHtml(
      prettier.format($.html(), { printWidth: Infinity, parser: 'html' }),
    );
    const filepath = `${pageLoader.getFilepath()}.html`;
    return fs.promises.writeFile(filepath, pageLoader.getChangedHtml());
  })
  .then(() => `${pageLoader.getFilepath()}.html`)
  .catch((error) => error);
