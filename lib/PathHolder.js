import path from 'path';

export default class PathHolder {
  constructor(url, dirpath) {
    this.url = new URL(url);
    this.dirpath = path.resolve(dirpath);
    this.filename = this.buildFilename();
    this.dirname = `${this.filename}_files`;
  }

  getUrl() {
    return this.url;
  }

  getDirpath() {
    return this.dirpath;
  }

  getDirname() {
    return this.dirname;
  }

  getFilename() {
    return this.filename;
  }

  getDirpathForResourses() {
    return path.join(this.getDirpath(), this.getDirname());
  }

  getPathToMainPage() {
    return path.join(this.getDirpath(), `${this.getFilename()}.html`);
  }

  getPathToResourse(name) {
    return path.join(this.getDirpath(), name);
  }

  getResourseName(url, tag) {
    const { pathname, hostname } = url;
    const { ext } = path.parse(pathname);
    const name = pathname.length === 1
      ? `${hostname.replaceAll('.', '-')}`
      : `${hostname.replaceAll('.', '-')}${pathname.replaceAll('/', '-').replaceAll('_', '-')}`;
    const resourceName = tag === 'link' && ext.length === 0
      ? `${name}.html`
      : name;
    return `${this.getDirname()}/${resourceName}`;
  }

  buildFilename() {
    const { pathname, hostname } = this.getUrl();
    return pathname.length === 1
      ? `${hostname.replaceAll('.', '-')}`
      : `${hostname.replaceAll('.', '-')}${pathname.replaceAll('/', '-')}`;
  }
}
