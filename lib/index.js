import 'axios-debug-log';
import axios from 'axios';
import fs from 'fs/promises';
import debug from './debug.js';
import changeHtml from './utils.js';
import PathHolder from './PathHolder.js';
import { networkError, fileSystemError } from './errors/index.js';

export default (url, dirpath = process.cwd()) => {
  const pathHolder = new PathHolder(url, dirpath);
  const htmlHolder = {};

  debug('request', `GET ${url}`);
  return axios(url)
    .then((response) => {
      debug('response', `successful request (GET ${url})`);

      const { origin } = new URL(url);
      const { changedHtml, links } = changeHtml(response.data, origin, pathHolder);
      htmlHolder.changedHtml = changedHtml;
      htmlHolder.links = links;
    })
    .catch((error) => {
      debug('error', `request failed (GET ${url})`);
      throw networkError(error);
    })
    .then(() => fs.mkdir(pathHolder.getDirpathForResourses())
      .then(() => {
        debug('fs', 'directory for resources created');
      }))
    .catch((error) => {
      debug('error', 'directory for resourses doesn\'t created');
      throw fileSystemError(error);
    })
    .then(() => {
      const filepath = pathHolder.getPathToMainPage();
      fs.writeFile(filepath, htmlHolder.changedHtml).then(() => {
        debug('download', `main page to ${filepath}`);
      });
      const tasks = htmlHolder.links.map(([resourceUrl, resourceName, tag]) => {
        debug('request', `GET ${resourceUrl.href}`);

        return [
          resourceUrl.href,
          axios(resourceUrl.href, { responseType: 'arraybuffer' })
            .then(({ data }) => {
              debug('response', `successful request (GET ${resourceUrl})`);
              const resourcePath = pathHolder.getPathToResourse(resourceName);
              return fs.writeFile(resourcePath, data)
                .then(() => {
                  debug('download', `${tag} to ${resourcePath}`);
                });
            })
            .catch((error) => {
              debug('error', `request failed (GET ${resourceUrl})`);
              console.error(networkError(error).message);
            }),
        ];
      });

      return [filepath, tasks];
    });
};
