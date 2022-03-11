import NetworkError from './NetworkError.js';
import ClientNetworkError from './ClientNetworkError.js';
import ServerNetworkError from './ServerNetworkError.js';
import FileSystemError from './FileSystemError.js';

export const networkError = (error, source) => {
  if (error.response) {
    const { response: { status, statusText, config: { url, method } } } = error;
    const description = String(status).startsWith('4') ? 'Client error' : 'Server error';
    const errorMessage = `${description} ${status} ${statusText} (${method.toUpperCase()} ${url})`;
    const Err = String(status).startsWith('4') ? ClientNetworkError : ServerNetworkError;

    if (source === 'resource') {
      console.error(errorMessage);
    } else {
      return new Err(errorMessage);
    }
  }
  if (error.request) {
    return new NetworkError(`${error.code} ${error.config.url}`);
  }

  return error;
};

export const fileSystemError = (error, dirname) => {
  switch (error.code) {
    case 'EEXIST':
      return new FileSystemError(`Directory ${dirname} already exists!`);
    case 'ENOENT':
      return new FileSystemError('Target directory doesn\'t exist!');
    case 'EROFS':
      return new FileSystemError('Forbidden operation!');
    case 'EACCES':
      return new FileSystemError('Permission denied!');
    default:
      return error;
  }
};
