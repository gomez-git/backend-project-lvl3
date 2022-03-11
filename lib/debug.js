import makeDebug from 'debug';

const {
  request, response, fs, download, error,
} = ({
  request: makeDebug('page-loader.request'),
  response: makeDebug('page-loader.response'),
  fs: makeDebug('page-loader.fs'),
  download: makeDebug('page-loader.download'),
  error: makeDebug('page-loader.error'),
});

export default (level, message) => {
  switch (level) {
    case 'request':
      return request(message);
    case 'response':
      return response(message);
    case 'download':
      return download(message);
    case 'fs':
      return fs(message);
    default:
      return error(message);
  }
};
