import 'axios-debug-log';
import axios from 'axios';
import fs from 'fs/promises';
import makeDebug from 'debug';
import prettier from 'prettier';
import * as cheerio from 'cheerio';
import PathHolder from './Path-Holder.js';

export default (url, dir) => {
  const request = makeDebug('page-loader.request');
  const debugResponse = makeDebug('page-loader.response');
  const download = makeDebug('page-loader.download');
  const debug = makeDebug('page-loader.fs');

  const pathHolder = new PathHolder(url, dir);
  request(url);
  return axios(url)
    .then((response) => {
      debugResponse(response.status, response.statusText, `(GET ${url})`);

      const tags = ['img', 'link', 'script'];
      const { origin } = new URL(url);
      const $ = cheerio.load(response.data);

      fs.mkdir(pathHolder.getDirpathForResourses())
        .then(() => {
          debug('directory for resources created');
        });

      tags.forEach((tag) => {
        const source = tag === 'link' ? 'href' : 'src';

        $(tag).each((i, elem) => {
          const resourceUrl = new URL($(elem).attr(source), origin);

          if ($(elem).attr(source) && resourceUrl.origin === origin) {
            const resourceName = pathHolder.getResourseName(resourceUrl, tag);

            $(elem).attr(source, resourceName);
            request(resourceUrl.href);
            axios(resourceUrl.href, { responseType: 'arraybuffer' })
              .then(({ data, status, statusText }) => {
                debugResponse(status, statusText, `(GET ${resourceUrl})`);
                fs.writeFile(pathHolder.getPathToResourse(resourceName), data)
                  .then(() => {
                    download('resourse to', pathHolder.getPathToResourse(resourceName));
                  });
              });
          }
        });
      });

      const changedHtml = prettier.format($.html(), {
        parser: 'html',
        printWidth: Infinity,
        htmlWhitespaceSensitivity: 'ignore',
      });

      return fs.writeFile(pathHolder.getPathToMainPage(), changedHtml)
        .then(() => {
          download('main page to', pathHolder.getPathToMainPage());
        });
    })
    .then(() => pathHolder.getPathToMainPage())
    .catch((error) => error);
};
