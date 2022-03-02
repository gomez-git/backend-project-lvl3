import path from 'path';

export default class PageLoader {
  constructor(url, dir) {
    this.url = new URL(url);
    this.dir = path.isAbsolute(dir)
      ? dir
      : path.join(process.cwd(), dir);
    this.filename = this.buildFilename();
    this.dirname = `${this.filename}_files`;
  }

  getUrl() {
    return this.url;
  }

  getDir() {
    return this.dir;
  }

  getDirname() {
    return this.dirname;
  }

  getFilename() {
    return this.filename;
  }

  getFilepath() {
    return path.join(this.getDir(), this.getFilename());
  }

  getDirpath() {
    return path.join(this.getDir(), this.getDirname());
  }

  getHtml() {
    return this.html;
  }

  getChangedHtml() {
    return this.changedHtml;
  }

  setHtml(html) {
    this.html = html;
  }

  setChangedHtml(html) {
    this.changedHtml = html;
  }

  buildFilename() {
    return this.getUrl().pathname.length === 1
      ? `${this.getUrl().host.replaceAll('.', '-')}`
      : `${this.getUrl().host.replaceAll('.', '-')}${this.getUrl().pathname.replaceAll('/', '-')}`;
  }
}
