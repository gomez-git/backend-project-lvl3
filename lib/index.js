import 'axios-debug-log';
import axios from 'axios';
import fs from 'fs/promises';
import debug from './debug.js';
import changeHtml from './utils.js';
import PathHolder from './PathHolder.js';
import { networkError, fileSystemError } from './errors/index.js';

export default (url, dir) => {
  const pathHolder = new PathHolder(url, dir);
  const htmlHolder = {};
  const dataHolder = {};

  debug('request', `GET ${url}`);
  return axios(url)
    .then((response) => {
      debug('response', `successful request (GET ${url})`);

      const { origin } = new URL(url);
      const { changedHtml, links } = changeHtml(response.data, origin, pathHolder);
      htmlHolder.changedHtml = changedHtml;

      return links;
    })
    .catch((err) => {
      debug('error', `request failed (GET ${url}`);
      throw networkError(err);
    })
    .then((links) => Promise.all(
      links.map(([resourceUrl, resourceName, tag]) => {
        debug('request', `GET ${resourceUrl.href}`);

        return axios(resourceUrl.href, { responseType: 'arraybuffer' })
          .then(({ data, status, statusText }) => {
            debug('response', `${status} ${statusText} (GET ${resourceUrl})`);

            return [data, pathHolder.getPathToResourse(resourceName), tag];
          })
          .catch((error) => {
            networkError(error, 'resource');

            return null;
          });
      }).filter((link) => link),
    ))
    .then((data) => {
      dataHolder.data = data;

      return fs.mkdir(pathHolder.getDirpathForResourses())
        .then(() => {
          debug('fs', 'directory for resources created');
        });
    })
    .catch((err) => {
      debug('error', 'directory for resourses doesn\'t created');
      throw fileSystemError(err, pathHolder.getDirname());
    })
    .then(() => Promise.all(
      [
        [htmlHolder.changedHtml, pathHolder.getPathToMainPage(), 'main page'],
        ...dataHolder.data,
      ].map(([data, resourcePath, tag]) => (
        fs.writeFile(resourcePath, data)
          .then(() => {
            debug('download', `${tag} to ${resourcePath}`);
          })
      )),
    ))
    .then(() => pathHolder.getPathToMainPage());
};
