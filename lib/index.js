import fs from 'fs/promises';
import axios from 'axios';
import cheerio from 'cheerio';
import prettier from 'prettier';
import PathHolder from './Path-Holder.js';

export default (url, dir, pathHolder = new PathHolder(url, dir)) => axios(url)
  .then((response) => {
    const tags = ['img', 'link', 'script'];
    const { origin } = new URL(url);
    const $ = cheerio.load(response.data);

    fs.mkdir(pathHolder.getDirpathForResourses());

    tags.forEach((tag) => {
      const source = tag === 'link' ? 'href' : 'src';

      $(tag).each((i, elem) => {
        const resourceUrl = new URL($(elem).attr(source), origin);

        if ($(elem).attr(source) && resourceUrl.origin === origin) {
          const resourceName = pathHolder.getResourseName(resourceUrl, tag);

          $(elem).attr(source, resourceName);
          axios(resourceUrl.href, { responseType: 'arraybuffer' })
            .then(({ data }) => {
              fs.writeFile(pathHolder.getPathToResourse(resourceName), data);
            });
        }
      });
    });

    const changedHtml = prettier.format($.html(), {
      parser: 'html',
      printWidth: Infinity,
      htmlWhitespaceSensitivity: 'ignore',
    });

    return fs.writeFile(pathHolder.getPathToMainPage(), changedHtml);
  })
  .then(() => pathHolder.getPathToMainPage())
  .catch((error) => error);
